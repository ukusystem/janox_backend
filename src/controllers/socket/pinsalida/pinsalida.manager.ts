import { MySQL2 } from '../../../database/mysql';
import { Init } from '../../../models/init';
import { EquipoSalidaMapManager } from '../../../models/maps';
import { PinSalidaNotifyManager } from '../../../models/system/system.pinsalida.notify';
import { genericLogger } from '../../../services/loggers';
import { EquipoSalida } from '../../../types/db';
import { filterUndefined } from '../../../utils/filterUndefined';
import { MapControladorPinSalida, MapObserverPinSalida, MapPinSalida, PinSalidaAddUpdateDTO, PinSalidaDTO, PinSalidaObserver, PinSalidaRowData, PinSalidaSocketDTO, SocketPinSalida } from './pinsalida.types';

export class PinSalidaSocketObserver implements PinSalidaObserver {
  #socket: SocketPinSalida;

  constructor(socket: SocketPinSalida) {
    this.#socket = socket;
  }

  updateEquiposSalida(data: EquipoSalida[]): void {
    this.#socket.nsp.emit('equipos_salida', data);
  }

  updateListPinesSalida(data: PinSalidaSocketDTO[], info: EquipoSalida): void {
    this.#socket.nsp.emit('list_pines_salida', data, info);
  }

  updateItemPinSalida(data: PinSalidaSocketDTO): void {
    this.#socket.nsp.emit('item_pin_salida', data);
  }
}

export class PinSalidaManager {
  static #pines: MapControladorPinSalida = new Map();
  static #observers: MapObserverPinSalida = new Map();

  static registerObserver(ctrl_id: number, new_observer: PinSalidaObserver): void {
    const observer = PinSalidaManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      PinSalidaManager.#observers.set(ctrl_id, new_observer);
    }
  }
  static unregisterObserver(ctrl_id: number): void {
    PinSalidaManager.#observers.delete(ctrl_id);
  }

  // static notifyEquiposSalida(ctrl_id: number, data: EquipoSalida[]): void {
  //   // unused
  // }

  static notifyListPinesSalida(ctrl_id: number, pin_salida: PinSalidaDTO): void {
    const observer = PinSalidaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      // posible add filter for es_id armado
      const newListPinSal = PinSalidaManager.getListPinesSalida(ctrl_id, pin_salida.es_id);
      const equiSal = EquipoSalidaMapManager.getEquipoSalida(pin_salida.es_id);
      if (equiSal !== undefined) {
        observer.updateListPinesSalida(newListPinSal, equiSal);
      }
    }
  }
  static notifyItemPinSalida(ctrl_id: number, pin_salida: PinSalidaDTO): void {
    const observer = PinSalidaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      // posible add conditional for es_id armado
      observer.updateItemPinSalida(pin_salida);
    }
  }

  static #add(ctrl_id: number, data: PinSalidaDTO, shouldNotify?: boolean) {
    const currController = PinSalidaManager.#pines.get(ctrl_id);
    if (currController === undefined) {
      const newPinSalidaMap: MapPinSalida = new Map();
      newPinSalidaMap.set(data.ps_id, data);

      PinSalidaManager.#pines.set(ctrl_id, newPinSalidaMap);
    } else {
      currController.set(data.ps_id, data);
    }
    // notifications:
    PinSalidaManager.notifyListPinesSalida(ctrl_id, data);
    PinSalidaNotifyManager.add(ctrl_id, data, shouldNotify);
  }

  static #update(ctrl_id: number, ps_id_update: number, fieldsToUpdate: Partial<PinSalidaDTO>, shouldNotify?: boolean) {
    const currController = PinSalidaManager.#pines.get(ctrl_id);
    if (currController !== undefined) {
      const pinSalida = currController.get(ps_id_update);
      if (pinSalida !== undefined) {
        const curPinSalida = { ...pinSalida };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ps_id, ...fieldsFiltered } = filterUndefined<PinSalidaDTO>(fieldsToUpdate);

        const { activo, es_id } = fieldsFiltered;
        const hasChangesActive = activo !== undefined && pinSalida.activo !== activo;
        const hasChangeEqSal = es_id !== undefined && pinSalida.es_id !== es_id;
        const currPinSalCopy = { ...pinSalida };

        Object.assign(pinSalida, fieldsFiltered);

        if (hasChangeEqSal) {
          PinSalidaManager.notifyListPinesSalida(ctrl_id, currPinSalCopy);
          PinSalidaManager.notifyListPinesSalida(ctrl_id, pinSalida);
        }
        // notifications:
        if (hasChangesActive) {
          PinSalidaManager.notifyListPinesSalida(ctrl_id, pinSalida);
        }
        PinSalidaManager.notifyItemPinSalida(ctrl_id, pinSalida);
        PinSalidaNotifyManager.update(ctrl_id, curPinSalida, fieldsFiltered, shouldNotify);
      }
    }
  }

  static add_update(ctrl_id: number, data: PinSalidaAddUpdateDTO) {
    const currController = PinSalidaManager.#pines.get(ctrl_id);
    const { activo, descripcion, estado, pin, automatico, es_id, orden, ps_id, shouldNotify } = data;

    if (currController === undefined) {
      //  only add
      if (es_id !== undefined && descripcion !== undefined && estado !== undefined && activo !== undefined && orden !== undefined) {
        PinSalidaManager.#add(ctrl_id, { activo, descripcion, estado, pin, automatico, es_id, orden, ps_id }, shouldNotify);
      }
    } else {
      const hasPinSalida = currController.has(ps_id);
      if (hasPinSalida) {
        PinSalidaManager.#update(ctrl_id, ps_id, data, shouldNotify);
      } else {
        if (es_id !== undefined && descripcion !== undefined && estado !== undefined && activo !== undefined && orden !== undefined) {
          PinSalidaManager.#add(ctrl_id, { activo, descripcion, estado, pin, automatico, es_id, orden, ps_id }, shouldNotify);
        }
      }
    }
  }

  static delete(ctrl_id: number, ps_id: number, permanent: boolean = false) {
    const currController = PinSalidaManager.#pines.get(ctrl_id);
    if (currController !== undefined) {
      const currPinSalida = currController.get(ps_id);
      if (currPinSalida !== undefined) {
        if (permanent) {
          currController.delete(ps_id);
        } else {
          Object.assign(currPinSalida, { activo: 0 });
        }

        // notifications:
        PinSalidaManager.notifyListPinesSalida(ctrl_id, currPinSalida);
      }
    }
  }

  static async init() {
    try {
      const regionNodos = await Init.getRegionNodos();
      regionNodos.forEach(async ({ ctrl_id, nododb_name }) => {
        try {
          const pinesSalida = await MySQL2.executeQuery<PinSalidaRowData[]>({
            sql: `SELECT * from ${nododb_name}.pinessalida`,
          });

          for (const pinSal of pinesSalida) {
            PinSalidaManager.#add(ctrl_id, { ...pinSal, automatico: false, orden: 0 });
          }
        } catch (error) {
          genericLogger.error(`PinSalidaManager | Error al inicializar pines de salida | ctrl_id : ${ctrl_id}`, error);
        }
      });
    } catch (error) {
      genericLogger.error('PinSalidaManager| Error al inicializar pines de salida', error);
      throw error;
    }
  }

  static getListEquiposSalida(ctrl_id: number): EquipoSalida[] {
    const currController = PinSalidaManager.#pines.get(ctrl_id);

    if (currController !== undefined) {
      const pinesSalida = Array.from(currController.values());
      const activesPinSalida = pinesSalida.filter((pin) => pin.activo === 1);
      const listUniqueEquiSalID = activesPinSalida.reduce<number[]>((prev, curr) => {
        const result = prev;
        const { es_id } = curr;
        if (!result.includes(es_id)) {
          result.push(es_id);
        }
        return result;
      }, []);

      const listEqSalida = listUniqueEquiSalID.reduce<EquipoSalida[]>((prev, es_id) => {
        const result = prev;
        const equiSal = EquipoSalidaMapManager.getEquipoSalida(es_id);
        if (equiSal !== undefined) {
          result.push(equiSal);
        }
        return result;
      }, []);

      return listEqSalida;
    }

    return [];
  }

  static getListPinesSalida(ctrl_id: number, es_id: number): PinSalidaSocketDTO[] {
    const currController = PinSalidaManager.#pines.get(ctrl_id);

    if (currController !== undefined) {
      const pinesSalida = Array.from(currController.values());
      const activesPinSalida = pinesSalida.filter((pin) => pin.activo === 1 && pin.es_id === es_id);
      // const listPinesSalida = activesPinSalida.reduce<PinSalidaSocketDTO[]>((prev, curr) => {
      //   const result = prev;
      //   const { es_id } = curr;
      //   if (!result.includes(es_id)) {
      //     result.push(es_id);
      //   }
      //   return result;
      // }, []);
      return activesPinSalida;
    }

    return [];
  }

  static getItemPinSalida(ctrl_id: number, ps_id: number): PinSalidaDTO | undefined {
    // se esta eliminando es_id
    const currController = PinSalidaManager.#pines.get(ctrl_id);

    if (currController !== undefined) {
      return currController.get(ps_id);
    }
    return undefined;
  }
}
