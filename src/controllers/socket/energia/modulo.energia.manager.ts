import { MySQL2 } from '../../../database/mysql';
import { Init } from '../../../models/init';
import { genericLogger } from '../../../services/loggers';
import { filterUndefined } from '../../../utils/filterUndefined';
import { EnergyManager } from '../energy.region/energy.manager';
import { MedEneListAction, MedEnergiaSocketDTO, MedEnergiaObserver, SocketMedEnergia, CtrlMedEnergiaMap, ObserverMedEnergiaMap, MedEnergiaObj, MedEnergiaMap, MedEnergiaAddUpdateDTO, MedEneState, MedidorEnergiaRowData } from './modulo.energia.types';

export class ModuloEnergiaObserver implements MedEnergiaObserver {
  #socket: SocketMedEnergia;

  constructor(socket: SocketMedEnergia) {
    this.#socket = socket;
  }

  updateListModEnergia(data: MedEnergiaSocketDTO, action: MedEneListAction): void {
    this.#socket.nsp.emit('list_energia', data, action);
  }

  updateModEnergia(data: MedEnergiaSocketDTO): void {
    this.#socket.nsp.emit('energia', data);
  }
}

export class MedidorEnergiaManager {
  static #medidor: CtrlMedEnergiaMap = new Map();
  static #observers: ObserverMedEnergiaMap = new Map();

  static registerObserver(ctrl_id: number, new_observer: MedEnergiaObserver): void {
    const observer = MedidorEnergiaManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      MedidorEnergiaManager.#observers.set(ctrl_id, new_observer);
    }
  }
  static unregisterObserver(ctrl_id: number): void {
    MedidorEnergiaManager.#observers.delete(ctrl_id);
  }

  static notifyListMedEnergia(ctrl_id: number, data: MedEnergiaSocketDTO, action: MedEneListAction): void {
    const observer = MedidorEnergiaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateListModEnergia(data, action);
    }
  }

  static notifyMedEnergia(ctrl_id: number, data: MedEnergiaSocketDTO): void {
    const observer = MedidorEnergiaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateModEnergia(data);
    }
  }

  static #add(ctrl_id: number, medidor: MedEnergiaObj) {
    const currController = MedidorEnergiaManager.#medidor.get(ctrl_id);
    if (currController === undefined) {
      const newMedEnergiaMap: MedEnergiaMap = new Map();
      newMedEnergiaMap.set(medidor.me_id, medidor);

      MedidorEnergiaManager.#medidor.set(ctrl_id, newMedEnergiaMap);
    } else {
      currController.set(medidor.me_id, medidor);
    }
    // notifications:
    if (medidor.activo === MedEneState.Activo) {
      MedidorEnergiaManager.notifyListMedEnergia(ctrl_id, medidor, 'add');
      EnergyManager.notifyEnergy(ctrl_id, medidor, 'add');
    }
  }

  static #update(ctrl_id: number, me_id_update: number, fieldsToUpdate: Partial<MedEnergiaObj>) {
    const currController = MedidorEnergiaManager.#medidor.get(ctrl_id);
    if (currController !== undefined) {
      const medEnergia = currController.get(me_id_update);
      if (medEnergia !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { me_id, ...fieldsFiltered } = filterUndefined<MedEnergiaObj>(fieldsToUpdate);

        const { activo } = fieldsFiltered;
        const hasChangeActivo = activo !== undefined && medEnergia.activo !== activo;

        Object.assign(medEnergia, fieldsFiltered);

        // notifications:
        if (hasChangeActivo) {
          if (activo === MedEneState.Activo) {
            MedidorEnergiaManager.notifyListMedEnergia(ctrl_id, medEnergia, 'add');
            EnergyManager.notifyEnergy(ctrl_id, medEnergia, 'add');
          }
          if (activo === MedEneState.Desactivado) {
            MedidorEnergiaManager.notifyListMedEnergia(ctrl_id, medEnergia, 'delete');
            EnergyManager.notifyEnergy(ctrl_id, medEnergia, 'delete');
          }
        }
        MedidorEnergiaManager.notifyMedEnergia(ctrl_id, medEnergia);
        EnergyManager.notifyEnergy(ctrl_id, medEnergia, 'update');
      }
    }
  }

  static delete(ctrl_id: number, me_id: number): boolean {
    const currController = MedidorEnergiaManager.#medidor.get(ctrl_id);
    if (currController !== undefined) {
      const medEnergia = currController.get(me_id);
      if (medEnergia !== undefined) {
        const hasDeleted = currController.delete(me_id);
        if (hasDeleted) {
          // notifications:
          MedidorEnergiaManager.notifyListMedEnergia(ctrl_id, medEnergia, 'delete');
          EnergyManager.notifyEnergy(ctrl_id, medEnergia, 'delete');
        }
        return hasDeleted;
      }
    }

    return false;
  }

  static async init() {
    try {
      const regionNodos = await Init.getRegionNodos();
      regionNodos.forEach(async ({ ctrl_id, nododb_name }) => {
        try {
          const medidoresEnergia = await MySQL2.executeQuery<MedidorEnergiaRowData[]>({
            sql: `SELECT * from ${nododb_name}.medidorenergia WHERE activo = 1`,
          });

          for (const medidor of medidoresEnergia) {
            MedidorEnergiaManager.#add(ctrl_id, medidor);
          }
        } catch (error) {
          genericLogger.error(`MedidorEnergiaManager | Error al inicializar medidor | ctrl_id : ${ctrl_id}`, error);
        }
      });
    } catch (error) {
      genericLogger.error('MedidorEnergiaManager| Error al inicializar medidores', error);
      throw error;
    }
  }

  static add_update(ctrl_id: number, medidor: MedEnergiaAddUpdateDTO) {
    const currController = MedidorEnergiaManager.#medidor.get(ctrl_id);
    const { me_id, activo, amperaje, descripcion, fdp, frecuencia, potenciakwh, potenciaw, voltaje } = medidor;

    if (currController === undefined) {
      //  only add
      if (activo !== undefined && amperaje !== undefined && descripcion !== undefined && fdp !== undefined && frecuencia !== undefined && potenciakwh !== undefined && potenciaw !== undefined && voltaje !== undefined) {
        MedidorEnergiaManager.#add(ctrl_id, { me_id, activo, amperaje, descripcion, fdp, frecuencia, potenciakwh, potenciaw, voltaje });
      }
    } else {
      const hasMedEnergia = currController.has(me_id);
      if (hasMedEnergia) {
        MedidorEnergiaManager.#update(ctrl_id, me_id, medidor);
      } else {
        if (activo !== undefined && amperaje !== undefined && descripcion !== undefined && fdp !== undefined && frecuencia !== undefined && potenciakwh !== undefined && potenciaw !== undefined && voltaje !== undefined) {
          MedidorEnergiaManager.#add(ctrl_id, { me_id, activo, amperaje, descripcion, fdp, frecuencia, potenciakwh, potenciaw, voltaje });
        }
      }
    }
  }

  static getListMedEnergia(ctrl_id: number): MedEnergiaObj[] {
    const currController = MedidorEnergiaManager.#medidor.get(ctrl_id);
    if (currController !== undefined) {
      const listMedEn = Array.from(currController.values());
      const listMedEnActives = listMedEn.filter((medidor) => medidor.activo === MedEneState.Activo);
      return listMedEnActives.sort((a, b) => a.me_id - b.me_id);
    }
    return [];
  }

  static getMedEnergiaItem(ctrl_id: number, me_id: number): MedEnergiaObj | undefined {
    const currController = MedidorEnergiaManager.#medidor.get(ctrl_id);
    if (currController !== undefined) {
      const medEnergia = currController.get(me_id);
      if (medEnergia !== undefined && medEnergia.activo === MedEneState.Activo) {
        return medEnergia;
      }
    }
    return undefined;
  }
}

// (async () => {
//   setInterval(() => {
//     const getRandomNumber = (min: number, max: number) => {
//       return Math.floor(Math.random() * (max - min + 1)) + min;
//     };
//     const randomVoltaje = getRandomNumber(110, 120);
//     const randomAmp = getRandomNumber(5, 10);
//     const newMedEnDTO: MedEnergiaAddUpdateDTO = {
//       me_id: 1,
//       voltaje: randomVoltaje,
//       amperaje: randomAmp,
//       fdp: 0,
//       frecuencia: 0,
//       potenciaw: 0,
//       potenciakwh: 0,
//       activo: 1,
//       descripcion: `Medidor 1 ${randomVoltaje}`,
//     };
//     const ctrl_id = 1;
//     console.log('actulizando: ', ctrl_id, newMedEnDTO);
//     MedidorEnergiaManager.add_update(ctrl_id, newMedEnDTO);
//   }, 10000);
//   setTimeout(() => {
//     console.log('Eliminando', 1, 4);
//     MedidorEnergiaManager.delete(1, 4);
//   }, 40000);
//   setTimeout(() => {
//     const newMedEnDTO: MedEnergiaAddUpdateDTO = {
//       me_id: 30,
//       voltaje: 120,
//       amperaje: 10,
//       fdp: 0,
//       frecuencia: 0,
//       potenciaw: 0,
//       potenciakwh: 0,
//       activo: 1,
//       descripcion: `Medidor Nuevo`,
//     };
//     const ctrl_id = 10;
//     console.log('Agregando ====', ctrl_id, newMedEnDTO);
//     MedidorEnergiaManager.add_update(ctrl_id, newMedEnDTO);
//   }, 30000);
// })();
