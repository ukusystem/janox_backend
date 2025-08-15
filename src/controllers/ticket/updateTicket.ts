import { Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';
import type { RequestWithUser } from '../../types/requests';
import { onFinishTicket } from '../../models/controllerapp/controller';
import { FinishTicket } from '../../models/controllerapp/src/finishTicket';
import { genericLogger } from '../../services/loggers';
import { TicketScheduleManager } from '../socket/ticket.schedule/ticket.schedule.manager';
import { TicketState } from '../../types/ticket.state';
import { UserRol } from '../../types/rol';
import { mqttService } from '../../services/mqtt/MqttService';
import { ControllerMapManager } from '../../models/maps';

interface TicketUpdateBody {
  action: number;
  ctrl_id: number;
  rt_id: number;
}

const ticketStatesID = Object.values(TicketState).filter((value) => typeof value === 'number');

export const upadateTicket = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const user = req.user;

  if (user !== undefined) {
    const data: TicketUpdateBody = req.body;
    const { action, ctrl_id, rt_id } = data;
    genericLogger.info(`Ticket Update Request | ctrl_id : ${ctrl_id} | rt_id : ${rt_id} | action : ${data.action}`, data);

    const isAllowedAction = ticketStatesID.includes(action);
    if (!isAllowedAction) {
      return res.status(403).json({ success: false, message: 'Acción no permitida.' });
    }

    const ticket = await Ticket.getTicketByCrtlIdAndTicketId({ ctrl_id: ctrl_id, rt_id: rt_id });

    if (ticket !== null) {
      const hasFinishedStatus = ticket.estd_id === TicketState.Rechazado || ticket.estd_id === TicketState.Cancelado || ticket.estd_id === TicketState.Finalizado || ticket.estd_id === TicketState.Anulado;
      if (hasFinishedStatus) {
        return res.status(403).json({ success: false, message: 'Acción no permitida.' });
      } else {
        const estdPendiente = ticket.estd_id === TicketState.Esperando && (action === TicketState.Aceptado || action === TicketState.Rechazado);
        const estdAceptBefore = ticket.estd_id === TicketState.Aceptado && action === TicketState.Cancelado;
        const estdAceptDuring = ticket.estd_id === TicketState.Aceptado && (action === TicketState.Finalizado || action === TicketState.Anulado); // 2 -> Aceptado

        const startDate = new Date(ticket.fechacomienzo);
        const endDate = new Date(ticket.fechatermino);
        const currentDate = new Date();
        const isBeforeEvent = currentDate < startDate;
        const isDuringEvent = currentDate >= startDate && currentDate < endDate;

        const beforeEventAction = isBeforeEvent && (estdPendiente || estdAceptBefore);
        const duringEventAction = isDuringEvent && estdAceptDuring;

        if (user.rl_id === UserRol.Administrador || user.rl_id === UserRol.Gestor) {
          if (beforeEventAction || duringEventAction) {
            try {
              const response = await onFinishTicket(new FinishTicket(action, ctrl_id, rt_id));
              if (response) {
                if (response.resultado) {
                  // success
                  TicketScheduleManager.update(ctrl_id, rt_id, { estd_id: action });
                  genericLogger.info(`Update Ticket successfully | ctrl_id = ${ctrl_id} | rt_id = ${rt_id} | action = ${action}`);

                  return res.json({ success: true, message: 'Accion realizada con éxito' });
                } else {
                  return res.json({ success: false, message: response.mensaje });
                }
              } else {
                return res.status(500).json({ success: false, message: 'Internal Server Error Update Ticket, Backend-Technician' });
              }
            } catch (error) {
              genericLogger.error(`Error update ticket | ctrl_id = ${ctrl_id} | rt_id = ${rt_id} | action = ${action}`, error);
              return res.status(500).json({ success: false, message: 'Internal Server Error, Backend-Technician' });
            }
          }
        } else if (user.rl_id === UserRol.Invitado) {
          const canUpdate = (ticket.estd_id === TicketState.Esperando || ticket.estd_id === TicketState.Aceptado) && action === TicketState.Cancelado;
          if (isBeforeEvent && canUpdate) {
            try {
              const response = await onFinishTicket(new FinishTicket(action, ctrl_id, rt_id));
              if (response) {
                if (response.resultado) {
                  // success
                  TicketScheduleManager.update(ctrl_id, rt_id, { estd_id: action });
                  const controller = ControllerMapManager.getController(ctrl_id, true);
                  mqttService.publisContrataNotification({ evento: 'ticket.cancelled', titulo: 'Ticket cancelado', mensaje: `Ticket #{${ticket.rt_id}} del sitio "${controller?.nodo ?? ctrl_id}" ha sido cancelado por ${user.nombre + ' ' + user.apellido}.` }, ticket.co_id);
                  return res.json({ success: true, message: 'Accion realizada con éxito' });
                } else {
                  return res.json({ success: false, message: response.mensaje });
                }
              } else {
                return res.status(500).json({ success: false, message: 'Internal Server Error Update Ticket, Backend-Technician' });
              }
            } catch (error) {
              genericLogger.error(`Error update ticket | ctrl_id = ${ctrl_id} | rt_id = ${rt_id} | action = ${action}`, error);
              return res.status(500).json({ success: false, message: 'Internal Server Error, Backend-Technician' });
            }
          }
        }
      }
    }

    res.status(400).json({
      success: false,
      message: 'Acción no permitida.',
    });
  } else {
    return res.status(401).json({ message: 'UNAUTHORIZED' });
  }
});
