import dayjs from 'dayjs';
import { ControllerRegTicketMap, ObserverRegTicketMap, RegistroTicketJobSchedule, RegistroTicketMap, RegistroTicketObj, RegistroTicketObserver, RegistroTicketSchedule, RegTicketCronContext, RegTicketSocketDTO, RegTicketState, SocketTicketSchedule, TicketAction } from './ticket.schedule.types';
import { onFinishTicket } from '../../../models/controllerapp/controller';
import { FinishTicket } from '../../../models/controllerapp/src/finishTicket';
import { CronJob } from 'cron';
import { filterUndefined } from '../../../utils/filterUndefined';
import { Ticket } from '../../../models/ticket';
import { genericLogger } from '../../../services/loggers';
import { mqttService } from '../../../services/mqtt/MqttService';
import { ControllerMapManager } from '../../../models/maps';

export class TicketSchedule implements RegistroTicketJobSchedule {
  #cron: CronJob<null, RegTicketCronContext>;
  constructor(cron: CronJob<null, RegTicketCronContext>) {
    this.#cron = cron;
  }

  stop(): void {
    this.#cron.stop();
  }

  start(): void {
    this.#cron.start();
  }
}

export class RegistroTicketSocketObserver implements RegistroTicketObserver {
  #socket: SocketTicketSchedule;

  constructor(socket: SocketTicketSchedule) {
    this.#socket = socket;
  }
  updateRegistroTicket(data: RegTicketSocketDTO, type: TicketAction): void {
    if (type === 'add') {
      this.#socket.nsp.emit('add_ticket', data);
    } else if (type === 'update') {
      this.#socket.nsp.emit('update_ticket', data);
    } else if (type === 'delete') {
      this.#socket.nsp.emit('delete_ticket', data);
    }
  }
}

export class TicketScheduleManager {
  static #tickets: ControllerRegTicketMap = new Map();
  static #observers: ObserverRegTicketMap = new Map();

  static registerObserver(ctrl_id: number, new_observer: RegistroTicketObserver): void {
    const observer = TicketScheduleManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      TicketScheduleManager.#observers.set(ctrl_id, new_observer);
    }
  }
  static unregisterObserver(ctrl_id: number): void {
    TicketScheduleManager.#observers.delete(ctrl_id);
  }

  static notifyRegistroTicket(ctrl_id: number, data: RegistroTicketObj, type: TicketAction): void {
    const observer = TicketScheduleManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateRegistroTicket({ ...data, ctrl_id }, type);
    }
  }

  static add(ctrl_id: number, newTicket: RegistroTicketObj): void {
    genericLogger.info(`TicketScheduleManager | add | ctrl_id : ${ctrl_id} | rt_id : ${newTicket.rt_id}`);
    const curTime = dayjs().unix();

    const isUnattended = newTicket.fechacomienzo < curTime && newTicket.estd_id === RegTicketState.Esperando;
    if (isUnattended) {
      // notify ticket unattended
      genericLogger.info(`TicketScheduleManager | Notify ticket unattended | ctrl_id : ${ctrl_id} | rt_id : ${newTicket.rt_id}`);
      onFinishTicket(new FinishTicket(RegTicketState.NoAtendido, ctrl_id, newTicket.rt_id));

      const controller = ControllerMapManager.getController(ctrl_id, true);
      mqttService.publisAdminNotification(
        {
          evento: 'ticket.not.attended',
          titulo: 'Ticket no atendido',
          mensaje: `El ticket #${newTicket.rt_id} del sitio "${controller?.nodo ?? ctrl_id}" no ha sido atendido`,
        },
        true,
      );
      return;
    }

    const newRegTicSchedule: RegistroTicketSchedule = {
      ticket: newTicket,
    };

    const canAddStartCronJob = newTicket.fechacomienzo > curTime && newTicket.estd_id === RegTicketState.Esperando;

    if (canAddStartCronJob) {
      const newStartCronJob = CronJob.from<null, RegTicketCronContext>({
        cronTime: new Date(newTicket.fechacomienzo * 1000),
        onTick: function (this: RegTicketCronContext) {
          const regTicketMap = TicketScheduleManager.#tickets.get(this.ctrl_id);
          if (regTicketMap !== undefined) {
            const regTicket = regTicketMap.get(this.rt_id);
            if (regTicket !== undefined) {
              if (regTicket.ticket.estd_id === RegTicketState.Esperando) {
                // notify ticket unattended
                genericLogger.info(`TicketScheduleManager | Notify ticket unattended | ctrl_id : ${ctrl_id} | rt_id : ${newTicket.rt_id}`);

                onFinishTicket(new FinishTicket(RegTicketState.NoAtendido, this.ctrl_id, this.rt_id));
                // delete ticket
                TicketScheduleManager.#delete(this.ctrl_id, this.rt_id);
                // notify
                const controller = ControllerMapManager.getController(this.ctrl_id, true);
                mqttService.publisAdminNotification(
                  {
                    evento: 'ticket.not.attended',
                    titulo: 'Ticket no atendido',
                    mensaje: `El ticket #${newTicket.rt_id} del sitio "${controller?.nodo ?? ctrl_id}" no ha sido atendido`,
                  },
                  true,
                );
              }
            }
          }
        },
        onComplete: null,
        start: false,
        context: { ...newTicket, ctrl_id },
      });

      newRegTicSchedule.startSchedule = new TicketSchedule(newStartCronJob);
    }

    const canAddEndCronJob = newTicket.fechatermino > curTime;
    if (canAddEndCronJob) {
      const newEndCronJob = CronJob.from<null, RegTicketCronContext>({
        cronTime: new Date(newTicket.fechatermino * 1000),
        onTick: function (this: RegTicketCronContext) {
          const regTicketMap = TicketScheduleManager.#tickets.get(this.ctrl_id);
          if (regTicketMap !== undefined) {
            if (regTicketMap.has(this.rt_id)) {
              // delete ticket
              TicketScheduleManager.#delete(this.ctrl_id, this.rt_id);
              // notify finish ticket
            }
          }
        },
        onComplete: null,
        start: false,
        context: { ...newTicket, ctrl_id },
      });
      newRegTicSchedule.endSchedule = new TicketSchedule(newEndCronJob);
    }

    if (newRegTicSchedule.startSchedule !== undefined || newRegTicSchedule.endSchedule !== undefined) {
      const regTicketMap = TicketScheduleManager.#tickets.get(ctrl_id);
      if (regTicketMap === undefined) {
        const newRegTicketMap: RegistroTicketMap = new Map();

        newRegTicSchedule.startSchedule?.start();
        newRegTicSchedule.endSchedule?.start();

        newRegTicketMap.set(newTicket.rt_id, newRegTicSchedule);
        TicketScheduleManager.#tickets.set(ctrl_id, newRegTicketMap);

        // notify add
        TicketScheduleManager.notifyRegistroTicket(ctrl_id, newTicket, 'add');
      } else {
        if (!regTicketMap.has(newTicket.rt_id)) {
          newRegTicSchedule.startSchedule?.start();
          newRegTicSchedule.endSchedule?.start();

          regTicketMap.set(newTicket.rt_id, newRegTicSchedule);

          //notify add
          TicketScheduleManager.notifyRegistroTicket(ctrl_id, newTicket, 'add');
        }
      }
    }
  }

  static #delete(ctrl_id: number, rt_id: number) {
    const regTicketMap = TicketScheduleManager.#tickets.get(ctrl_id);
    if (regTicketMap !== undefined) {
      const regTicketSchedule = regTicketMap.get(rt_id);
      if (regTicketSchedule !== undefined) {
        // stop cron jobs:
        regTicketSchedule.startSchedule?.stop();
        regTicketSchedule.endSchedule?.stop();
        // delete
        regTicketMap.delete(rt_id);
        // notify delete
        TicketScheduleManager.notifyRegistroTicket(ctrl_id, regTicketSchedule.ticket, 'delete');
      }
    }
  }

  static update(ctrl_id: number, rt_id_update: number, fieldsToUpdate: Partial<RegistroTicketObj>) {
    const regTicketMap = TicketScheduleManager.#tickets.get(ctrl_id);
    if (regTicketMap !== undefined) {
      const regTicketSchedule = regTicketMap.get(rt_id_update);
      if (regTicketSchedule !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rt_id, ...fieldsFiltered } = filterUndefined<RegistroTicketObj>(fieldsToUpdate);
        Object.assign(regTicketSchedule.ticket, fieldsFiltered);

        // notify update:
        TicketScheduleManager.notifyRegistroTicket(ctrl_id, regTicketSchedule.ticket, 'update');

        const state_id = regTicketSchedule.ticket.estd_id;
        if (state_id === RegTicketState.Cancelado || state_id === RegTicketState.Rechazado || state_id === RegTicketState.Finalizado || state_id === RegTicketState.Anulado || state_id === RegTicketState.NoAtendido) {
          // delete ticket
          TicketScheduleManager.#delete(ctrl_id, rt_id_update);
        }
      }
    }
  }

  static getListRegTicket(ctrl_id: number): RegTicketSocketDTO[] {
    const regTicketMap = TicketScheduleManager.#tickets.get(ctrl_id);
    if (regTicketMap !== undefined) {
      const listReg = Array.from(regTicketMap.values()).map<RegTicketSocketDTO>(({ ticket }) => ({ ...ticket, ctrl_id }));
      const nowDateNext7 = dayjs().startOf('date').add(7, 'day').unix();
      const listRegTicketNext7 = listReg.filter((ticket) => ticket.fechatermino < nowDateNext7);

      return listRegTicketNext7;
    }
    return [];
  }

  static async init() {
    try {
      const initialTickets = await Ticket.getTicketsPendientesAceptados();
      for (const ticket of initialTickets) {
        const { ctrl_id, fechacomienzo, fechatermino, ...rest } = ticket;
        const newRegTicket: RegistroTicketObj = {
          ...rest,
          fechacomienzo: dayjs(fechacomienzo).unix(),
          fechatermino: dayjs(fechatermino).unix(),
        };
        TicketScheduleManager.add(ctrl_id, newRegTicket);
      }
    } catch (error) {
      genericLogger.error(`TicketScheduleManager | Error al inicializar tickets`, error);
      throw error;
    }
  }
}
