import { MySQL2 } from '../../../database/mysql';
import { Init } from '../../../models/init';
import { PersonalMapManager } from '../../../models/maps';
import { genericLogger } from '../../../services/loggers';
import { MapObseverRegAcc, MapRegistroAcceso, RegistroAccesoDTO, RegistroAccesoObserver, RegistroAccesoRowData, RegistroAccesoSocketDTO, SocketRegistroAcceso } from './registroacceso.types';

export class RegistroAccesoSocketObserver implements RegistroAccesoObserver {
  #socket: SocketRegistroAcceso;

  constructor(socket: SocketRegistroAcceso) {
    this.#socket = socket;
  }

  addRegistroAcceso(data: RegistroAccesoSocketDTO): void {
    this.#socket.nsp.emit('new_registro_acceso', data);
  }
}

export class RegistroAccesoManager {
  static #registros: MapRegistroAcceso = new Map();
  static #observers: MapObseverRegAcc = new Map();
  static #NUM_REGISTROS: number = 5;

  static registerObserver(ctrl_id: number, new_observer: RegistroAccesoObserver): void {
    const observer = RegistroAccesoManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      RegistroAccesoManager.#observers.set(ctrl_id, new_observer);
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    RegistroAccesoManager.#observers.delete(ctrl_id);
  }

  static notifyAddRegistroAcceso(ctrl_id: number, data: RegistroAccesoDTO): void {
    const observer = RegistroAccesoManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      const personal = PersonalMapManager.getPersonal(data.p_id);
      const socketData: RegistroAccesoSocketDTO = { ...data, personal: personal };

      observer.addRegistroAcceso(socketData);
    }
  }

  static add(ctrl_id: number, newRegAcc: RegistroAccesoDTO) {
    const currRegisters = RegistroAccesoManager.#registros.get(ctrl_id);

    if (currRegisters !== undefined) {
      const newRegisters = [newRegAcc, ...currRegisters];

      if (newRegisters.length > RegistroAccesoManager.#NUM_REGISTROS) {
        newRegisters.splice(RegistroAccesoManager.#NUM_REGISTROS);
      }

      RegistroAccesoManager.#registros.set(ctrl_id, newRegisters);
    } else {
      RegistroAccesoManager.#registros.set(ctrl_id, [newRegAcc]);
    }
    // notify
    RegistroAccesoManager.notifyAddRegistroAcceso(ctrl_id, newRegAcc);
  }

  static getRegistrosCtrl(ctrl_id: number): RegistroAccesoDTO[] {
    const registros = RegistroAccesoManager.#registros.get(ctrl_id);
    if (registros !== undefined) {
      return [...registros];
    }
    return [];
  }

  static async init() {
    try {
      const regionNodos = await Init.getRegionNodos();
      regionNodos.forEach(async ({ ctrl_id, nododb_name }) => {
        try {
          const listRegAcc = await MySQL2.executeQuery<RegistroAccesoRowData[]>({
            sql: `SELECT * from ${nododb_name}.registroacceso ORDER BY ra_id DESC LIMIT ${RegistroAccesoManager.#NUM_REGISTROS}`,
          });
          for (const regAcc of listRegAcc.reverse()) {
            RegistroAccesoManager.add(ctrl_id, regAcc);
          }
        } catch (error) {
          genericLogger.error(`RegistroAccesoManager | Error al inicializar registros de acceso | ctrl_id : ${ctrl_id}`, error);
        }
      });
    } catch (error) {
      genericLogger.error(`RegistroAccesoManager | Error al inicializar registros de acceso`, error);
      throw error;
    }
  }
}
