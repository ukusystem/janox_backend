import { MySQL2 } from '../../../database/mysql';
import { Init } from '../../../models/init';
import { genericLogger } from '../../../services/loggers';
import { filterUndefined } from '../../../utils/filterUndefined';
import { AlarmManager } from '../alarm';
import { MapControladorPinEntrada, MapObserverPinEntrada, MapPinEntrada, PinEntradaAddUpdateDTO, PinEntradaDTO, PinEntradaDTORowData, PinEntradaSocketDTO, PinesEntradaObserver, SocketPinEntrada } from './pinentrada.types';

export class PinesSalidaSocketObserver implements PinesEntradaObserver {
  #socket: SocketPinEntrada;

  constructor(socket: SocketPinEntrada) {
    this.#socket = socket;
  }
  updateListPinesEntrada(data: PinEntradaSocketDTO[]): void {
    this.#socket.nsp.emit('list_pines_entrada', data);
  }
  updateItemPinEntrada(data: PinEntradaSocketDTO): void {
    this.#socket.nsp.emit('item_pin_entrada', data);
  }
  updateControllerMode(data: 0 | 1): void {
    this.#socket.nsp.emit('controller_mode', data);
  }
  updateControllerSecurity(data: 0 | 1): void {
    this.#socket.nsp.emit('controller_security', data);
  }
}

export class PinEntradaManager {
  static #pines: MapControladorPinEntrada = new Map();
  static #observers: MapObserverPinEntrada = new Map();

  static registerObserver(ctrl_id: number, new_observer: PinesEntradaObserver): void {
    const observer = PinEntradaManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      PinEntradaManager.#observers.set(ctrl_id, new_observer);
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    PinEntradaManager.#observers.delete(ctrl_id);
  }

  static notifyListPinesEntrada(ctrl_id: number, _data: PinEntradaDTO): void {
    const observer = PinEntradaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      const listPinEntrada = PinEntradaManager.getListPinesEntrada(ctrl_id);
      observer.updateListPinesEntrada(listPinEntrada);
    }
  }
  static notifyItemPinEntrada(ctrl_id: number, data: PinEntradaDTO): void {
    const observer = PinEntradaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateItemPinEntrada(data);
    }
  }
  static notifyControllerMode(ctrl_id: number, data: 0 | 1): void {
    const observer = PinEntradaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateControllerMode(data);
    }
  }
  static notifyControllerSecurity(ctrl_id: number, data: 0 | 1): void {
    const observer = PinEntradaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateControllerSecurity(data);
    }
  }

  static #add(ctrl_id: number, data: PinEntradaDTO) {
    const currController = PinEntradaManager.#pines.get(ctrl_id);
    if (currController === undefined) {
      const newPinEntradaMap: MapPinEntrada = new Map();
      newPinEntradaMap.set(data.pe_id, data);

      PinEntradaManager.#pines.set(ctrl_id, newPinEntradaMap);
    } else {
      currController.set(data.pe_id, data);
    }
    // notifications:
    PinEntradaManager.notifyListPinesEntrada(ctrl_id, data);
    AlarmManager.notifyPinEntrada(ctrl_id, data.pe_id, 'add');
  }

  static #update(ctrl_id: number, pe_id_update: number, fieldsToUpdate: Partial<PinEntradaDTO>) {
    const currController = PinEntradaManager.#pines.get(ctrl_id);
    if (currController !== undefined) {
      const pinEntrada = currController.get(pe_id_update);
      if (pinEntrada !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pe_id, ...fieldsFiltered } = filterUndefined<PinEntradaDTO>(fieldsToUpdate);

        const { activo } = fieldsFiltered;
        const hasChangeActivo = activo !== undefined && pinEntrada.activo !== activo;

        Object.assign(pinEntrada, fieldsFiltered);

        // notifications:
        if (hasChangeActivo) {
          PinEntradaManager.notifyListPinesEntrada(ctrl_id, pinEntrada);
        }

        PinEntradaManager.notifyItemPinEntrada(ctrl_id, pinEntrada);
        AlarmManager.notifyPinEntrada(ctrl_id, pe_id_update, 'update');
      }
    }
  }

  static add_update(ctrl_id: number, data: PinEntradaAddUpdateDTO) {
    const currController = PinEntradaManager.#pines.get(ctrl_id);
    const { pe_id, activo, descripcion, ee_id, estado, pin } = data;

    if (currController === undefined) {
      //  only add
      if (activo !== undefined && descripcion !== undefined && ee_id !== undefined && estado !== undefined) {
        PinEntradaManager.#add(ctrl_id, { pe_id, activo, descripcion, ee_id, estado, pin });
      }
    } else {
      const hasPinEntrada = currController.has(pe_id);
      if (hasPinEntrada) {
        PinEntradaManager.#update(ctrl_id, pe_id, data);
      } else {
        if (activo !== undefined && descripcion !== undefined && ee_id !== undefined && estado !== undefined) {
          PinEntradaManager.#add(ctrl_id, { pe_id, activo, descripcion, ee_id, estado, pin });
        }
      }
    }
  }

  static delete(ctrl_id: number, pe_id: number) {
    const currController = PinEntradaManager.#pines.get(ctrl_id);
    if (currController !== undefined) {
      const currPinEntrada = currController.get(pe_id);
      if (currPinEntrada !== undefined) {
        // currController.set(pe_id, { ...currPinEntrada, activo: 0 });
        Object.assign(currPinEntrada, { activo: 0 });

        // notifications:
        PinEntradaManager.notifyListPinesEntrada(ctrl_id, currPinEntrada);
        AlarmManager.notifyPinEntrada(ctrl_id, pe_id, 'delete');
      }
    }
  }

  static getPinEntrada(ctrl_id: number, pe_id: number): PinEntradaDTO | undefined {
    const currController = PinEntradaManager.#pines.get(ctrl_id);
    if (currController !== undefined) {
      const currPinEntrada = currController.get(pe_id);
      return currPinEntrada;
    }
    return undefined;
  }

  static getListPinesEntrada(ctrl_id: number): PinEntradaDTO[] {
    const currController = PinEntradaManager.#pines.get(ctrl_id);
    if (currController !== undefined) {
      const pinesEntrada = Array.from(currController.values());
      const activePinEntrada = pinesEntrada.filter((pin) => pin.activo === 1);
      const pinesEntradaOrdered = activePinEntrada.sort((a, b) => a.estado - b.estado); // comprobar
      return pinesEntradaOrdered;
    }

    return [];
  }

  static async init() {
    try {
      const regionNodos = await Init.getRegionNodos();
      regionNodos.forEach(async ({ ctrl_id, nododb_name }) => {
        try {
          const pinesEntrada = await MySQL2.executeQuery<PinEntradaDTORowData[]>({
            sql: `SELECT * from ${nododb_name}.pinesentrada`,
          });

          for (const pinEnt of pinesEntrada) {
            PinEntradaManager.#add(ctrl_id, pinEnt);
          }
        } catch (error) {
          genericLogger.error(`PinEntradaManager | Error al inicializar pines de entrada | ctrl_id : ${ctrl_id}`, error);
        }
      });
    } catch (error) {
      genericLogger.error('PinEntradaManager| Error al inicializar pines de entrada', error);
      throw error;
    }
  }
}

// (() => {
//   const getBinary = () => {
//     return Math.random() < 0.5 ? 0 : 1;
//   };
//   setInterval(() => {
//     const updated: PinEntradaAddUpdateDTO = { pe_id: 1, pin: 1, activo: 1, descripcion: undefined, ee_id: undefined, estado: getBinary() };
//     console.log('Actualizar pin entrada', updated);
//     PinEntradaManager.add_update(1, updated);
//   }, 10000);
// })();
