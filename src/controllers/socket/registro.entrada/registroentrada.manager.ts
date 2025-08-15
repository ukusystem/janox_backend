import { MySQL2 } from '../../../database/mysql';
import { Init } from '../../../models/init';
import { EquipoEntradaMapManager } from '../../../models/maps';
import { genericLogger } from '../../../services/loggers';
import { PinEntradaManager } from '../pinentrada';
import { MapObseverRegEnt, MapRegistroEntrada, RegistroEntradaAddDTO, RegistroEntradaDTO, RegistroEntradaObserver, RegistroEntradaRowData, RegistroEntradaSocketDTO, SocketRegistroEntrada } from './registroentrada.types';

export class RegistroEntradaSocketObserver implements RegistroEntradaObserver {
  #socket: SocketRegistroEntrada;

  constructor(socket: SocketRegistroEntrada) {
    this.#socket = socket;
  }

  addRegistroAcceso(data: RegistroEntradaSocketDTO): void {
    this.#socket.nsp.emit('new_registro_entrada', data);
  }
}

export class RegistroEntradaManager {
  static #registros: MapRegistroEntrada = new Map();
  static #observers: MapObseverRegEnt = new Map();
  static #NUM_REGISTROS: number = 5;

  static registerObserver(ctrl_id: number, new_observer: RegistroEntradaObserver): void {
    const observer = RegistroEntradaManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      RegistroEntradaManager.#observers.set(ctrl_id, new_observer);
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    RegistroEntradaManager.#observers.delete(ctrl_id);
  }

  static notifyAddRegistroEntrada(ctrl_id: number, data: RegistroEntradaDTO): void {
    const observer = RegistroEntradaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      const equEnt = EquipoEntradaMapManager.getEquipoEntrada(data.ee_id);
      const socketData: RegistroEntradaSocketDTO = { ...data, equipoEntrada: equEnt };
      observer.addRegistroAcceso(socketData);
    }
  }

  static add(ctrl_id: number, newRegEntr: RegistroEntradaAddDTO) {
    let new_ee_id: number | undefined = newRegEntr.ee_id;

    if (new_ee_id === undefined) {
      const currPinEntrada = PinEntradaManager.getPinEntrada(ctrl_id, newRegEntr.pin); // pin === pe_id
      if (currPinEntrada !== undefined) {
        new_ee_id = currPinEntrada.ee_id; // assign ee_id
      }
    }

    if (new_ee_id !== undefined) {
      const new_reg: RegistroEntradaDTO = { ...newRegEntr, ee_id: new_ee_id };

      const currRegisters = RegistroEntradaManager.#registros.get(ctrl_id);

      if (currRegisters !== undefined) {
        const newRegisters = [new_reg, ...currRegisters];

        if (newRegisters.length > RegistroEntradaManager.#NUM_REGISTROS) {
          newRegisters.splice(RegistroEntradaManager.#NUM_REGISTROS);
        }

        RegistroEntradaManager.#registros.set(ctrl_id, newRegisters);
      } else {
        RegistroEntradaManager.#registros.set(ctrl_id, [new_reg]);
      }
      // notify
      RegistroEntradaManager.notifyAddRegistroEntrada(ctrl_id, new_reg);
    }
  }

  static getRegistrosCtrl(ctrl_id: number): RegistroEntradaDTO[] {
    const registros = RegistroEntradaManager.#registros.get(ctrl_id);
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
          const listRegEnt = await MySQL2.executeQuery<RegistroEntradaRowData[]>({
            sql: `SELECT * from ${nododb_name}.registroentrada ORDER BY rentd_id DESC LIMIT ${RegistroEntradaManager.#NUM_REGISTROS}`,
          });
          for (const regAcc of listRegEnt.reverse()) {
            RegistroEntradaManager.add(ctrl_id, regAcc);
          }
        } catch (error) {
          genericLogger.error(`RegistroEntradaManager | Error al inicializar registros de entrada | ctrl_id : ${ctrl_id}`, error);
        }
      });
    } catch (error) {
      genericLogger.error(`RegistroEntradaManager | Error al inicializar registros de entrada`, error);
      throw error;
    }
  }
}
