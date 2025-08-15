import { MySQL2 } from '../../../database/mysql';
import { Init } from '../../../models/init';
import { genericLogger } from '../../../services/loggers';
import { filterUndefined } from '../../../utils/filterUndefined';
import { TemperatureManager } from '../temperature.region/temperature.manager';
import { ControllerSenTempMap, SensorTemperaturaObserver, SenTempAction, SenTempState, SocketSenTemperatura, ObserverSenTempMap, SenTemperarturaObj, SenTemperaturaMap, SensorTemperaturaRowData, SenTemperaturaAddUpdateDTO, SenTemperaturaSocketDTO } from './sensor.temperatura.types';

export class SenTempSocketObserver implements SensorTemperaturaObserver {
  #socket: SocketSenTemperatura;

  constructor(socket: SocketSenTemperatura) {
    this.#socket = socket;
  }
  updateListSenTemp(data: SenTemperaturaSocketDTO, action: SenTempAction): void {
    this.#socket.nsp.emit('list_temperature', data, action);
  }
  updateSenTemp(data: SenTemperaturaSocketDTO): void {
    this.#socket.nsp.emit('temperature', data);
  }
}

export class SensorTemperaturaManager {
  static #sensores: ControllerSenTempMap = new Map();
  static #observers: ObserverSenTempMap = new Map();

  static registerObserver(ctrl_id: number, new_observer: SensorTemperaturaObserver): void {
    const observer = SensorTemperaturaManager.#observers.get(ctrl_id);
    if (observer === undefined) {
      SensorTemperaturaManager.#observers.set(ctrl_id, new_observer);
    }
  }
  static unregisterObserver(ctrl_id: number): void {
    SensorTemperaturaManager.#observers.delete(ctrl_id);
  }
  static notifyListSenTemp(ctrl_id: number, data: SenTemperarturaObj, action: SenTempAction): void {
    const observer = SensorTemperaturaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateListSenTemp(data, action);
    }
  }
  static notifySenTemp(ctrl_id: number, data: SenTemperarturaObj): void {
    const observer = SensorTemperaturaManager.#observers.get(ctrl_id);
    if (observer !== undefined) {
      observer.updateSenTemp(data);
    }
  }

  static #add(ctrl_id: number, sensor: SenTemperarturaObj) {
    const currController = SensorTemperaturaManager.#sensores.get(ctrl_id);
    if (currController === undefined) {
      const newMedEnergiaMap: SenTemperaturaMap = new Map();
      newMedEnergiaMap.set(sensor.st_id, sensor);

      SensorTemperaturaManager.#sensores.set(ctrl_id, newMedEnergiaMap);
    } else {
      currController.set(sensor.st_id, sensor);
    }
    // notifications:
    if (sensor.activo === SenTempState.Activo) {
      SensorTemperaturaManager.notifyListSenTemp(ctrl_id, sensor, 'add');
      TemperatureManager.notifyTemperature(ctrl_id, sensor, 'add');
    }
  }

  static #update(ctrl_id: number, st_id_update: number, fieldsToUpdate: Partial<SenTemperarturaObj>) {
    const currController = SensorTemperaturaManager.#sensores.get(ctrl_id);
    if (currController !== undefined) {
      const senTemperatura = currController.get(st_id_update);
      if (senTemperatura !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { st_id, ...fieldsFiltered } = filterUndefined<SenTemperarturaObj>(fieldsToUpdate);

        const { activo } = fieldsFiltered;
        const hasChangeActivo = activo !== undefined && senTemperatura.activo !== activo;

        Object.assign(senTemperatura, fieldsFiltered);

        // notifications:
        if (hasChangeActivo) {
          if (activo === SenTempState.Activo) {
            SensorTemperaturaManager.notifyListSenTemp(ctrl_id, senTemperatura, 'add');
            TemperatureManager.notifyTemperature(ctrl_id, senTemperatura, 'add');
          }
          if (activo === SenTempState.Desactivado) {
            SensorTemperaturaManager.notifyListSenTemp(ctrl_id, senTemperatura, 'delete');
            TemperatureManager.notifyTemperature(ctrl_id, senTemperatura, 'delete');
          }
        }
        SensorTemperaturaManager.notifySenTemp(ctrl_id, senTemperatura);
        TemperatureManager.notifyTemperature(ctrl_id, senTemperatura, 'update');
      }
    }
  }

  static delete(ctrl_id: number, st_id: number): boolean {
    const currController = SensorTemperaturaManager.#sensores.get(ctrl_id);
    if (currController !== undefined) {
      const senTemperatura = currController.get(st_id);
      if (senTemperatura !== undefined) {
        const hasDeleted = currController.delete(st_id);
        if (hasDeleted) {
          // notifications:
          SensorTemperaturaManager.notifyListSenTemp(ctrl_id, senTemperatura, 'delete');
          TemperatureManager.notifyTemperature(ctrl_id, senTemperatura, 'delete');
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
          const sensoresTemp = await MySQL2.executeQuery<SensorTemperaturaRowData[]>({
            sql: `SELECT * from ${nododb_name}.sensortemperatura WHERE activo = 1`,
          });

          for (const sensor of sensoresTemp) {
            SensorTemperaturaManager.#add(ctrl_id, sensor);
          }
        } catch (error) {
          genericLogger.error(`SensorTemperaturaManager | Error al inicializar sensor | ctrl_id : ${ctrl_id}`, error);
        }
      });
    } catch (error) {
      genericLogger.error('SensorTemperaturaManager| Error al inicializar sensores', error);
      throw error;
    }
  }

  static add_update(ctrl_id: number, sensor: SenTemperaturaAddUpdateDTO) {
    const currController = SensorTemperaturaManager.#sensores.get(ctrl_id);
    const { st_id, activo, actual, serie, ubicacion } = sensor;

    if (currController === undefined) {
      //  only add
      if (activo !== undefined && actual !== undefined && serie !== undefined && ubicacion !== undefined) {
        SensorTemperaturaManager.#add(ctrl_id, { st_id, activo, actual, serie, ubicacion });
      }
    } else {
      const hasMedEnergia = currController.has(st_id);
      if (hasMedEnergia) {
        SensorTemperaturaManager.#update(ctrl_id, st_id, sensor);
      } else {
        if (activo !== undefined && actual !== undefined && serie !== undefined && ubicacion !== undefined) {
          SensorTemperaturaManager.#add(ctrl_id, { st_id, activo, actual, serie, ubicacion });
        }
      }
    }
  }

  static getListSenTemp(ctrl_id: number): SenTemperarturaObj[] {
    const currController = SensorTemperaturaManager.#sensores.get(ctrl_id);
    if (currController !== undefined) {
      const listSenTemp = Array.from(currController.values());
      const listSenTempActives = listSenTemp.filter((medidor) => medidor.activo === SenTempState.Activo);
      return listSenTempActives.sort((a, b) => a.st_id - b.st_id);
    }

    return [];
  }

  static getSenTempItem(ctrl_id: number, st_id: number) {
    const currController = SensorTemperaturaManager.#sensores.get(ctrl_id);
    if (currController !== undefined) {
      const senTemperatura = currController.get(st_id);
      if (senTemperatura !== undefined && senTemperatura.activo === SenTempState.Activo) {
        return senTemperatura;
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
//     const randomTemperature = getRandomNumber(0, 50);
//     const newDTO: SenTemperaturaAddUpdateDTO = {
//       st_id: 1,
//       serie: 'FDSJFDSIHFASD',
//       ubicacion: `Ubicación 1 ${randomTemperature}`,
//       actual: randomTemperature,
//       activo: 1,
//     };
//     const ctrl_id = 1;
//     console.log('actulizando: ', ctrl_id, newDTO);
//     SensorTemperaturaManager.add_update(ctrl_id, newDTO);
//   }, 10000);
//   setTimeout(() => {
//     console.log('Eliminando', 1, 2);
//     SensorTemperaturaManager.delete(1, 2);
//   }, 40000);
//   setTimeout(() => {
//     const newDTO: SenTemperaturaAddUpdateDTO = {
//       st_id: 30,
//       serie: 'fds3289sdf',
//       ubicacion: `Ubicación Nuevo `,
//       actual: 30,
//       activo: 1,
//     };
//     const ctrl_id = 1;
//     console.log('Agregando ====', ctrl_id, newDTO);
//     SensorTemperaturaManager.add_update(ctrl_id, newDTO);
//   }, 20000);
// })();
