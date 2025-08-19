import { ControllerMapManager, RegionMapManager } from '../../../models/maps';
import { Region } from '../../../types/db';
import { SensorTemperaturaManager } from '../temperatura';
import { ControllerDataTemperature, InitialDataTemperature, SocketTemperature, TemperatureActionType, TemperatureObserver, TemperatureSocketDTO } from './temperature.types';

export class TemperatureObserverImp implements TemperatureObserver {
  #socket: SocketTemperature;
  constructor(socket: SocketTemperature) {
    this.#socket = socket;
  }
  emitTemperature(ctrl_id: number, data: TemperatureSocketDTO, action: TemperatureActionType): void {
    this.#socket.nsp.emit('temperature', ctrl_id, data, action);
  }
  emitController(ctrl_id: number, data: ControllerDataTemperature, action: TemperatureActionType): void {
    this.#socket.nsp.emit('controller', ctrl_id, data, action);
  }
  emitRegion(rgn_id: number, data: Region, action: TemperatureActionType): void {
    this.#socket.nsp.emit('region', rgn_id, data, action);
  }
}

export class TemperatureManager {
  static #observer: TemperatureObserver | null = null;

  static registerObserver(new_observer: TemperatureObserver): void {
    if (TemperatureManager.#observer === null) {
      TemperatureManager.#observer = new_observer;
    }
  }

  static unregisterObserver(): void {
    if (TemperatureManager.#observer !== null) {
      TemperatureManager.#observer = null;
    }
  }

  static notifyTemperature(ctrl_id: number, data: TemperatureSocketDTO, action: TemperatureActionType): void {
    if (TemperatureManager.#observer !== null) {
      TemperatureManager.#observer.emitTemperature(ctrl_id, data, action);
    }
  }

  static notifyController(ctrl_id: number, data: ControllerDataTemperature, action: TemperatureActionType): void {
    if (TemperatureManager.#observer !== null) {
      TemperatureManager.#observer.emitController(ctrl_id, data, action);
    }
  }

  static notifyRegion(rgn_id: number, action: TemperatureActionType): void {
    if (TemperatureManager.#observer !== null) {
      const region = RegionMapManager.getRegion(rgn_id);
      if (region !== undefined) {
        TemperatureManager.#observer.emitRegion(rgn_id, region, action);
      }
    }
  }

  static getInitialData(): InitialDataTemperature {
    const activeControllers = ControllerMapManager.getAllControllers(true);
    const initialData: InitialDataTemperature = {};

    activeControllers.forEach((controller) => {
      const { ctrl_id, activo, conectado, descripcion, modo, nodo, rgn_id, seguridad, direccion } = controller;

      // controlador
      const ctrlData: ControllerDataTemperature = { ctrl_id, activo, conectado, descripcion, modo, nodo, rgn_id, seguridad, direccion };

      // sensor temperatura
      const senTemperature = SensorTemperaturaManager.getListSenTemp(ctrl_id);

      if (!initialData[ctrl_id]) {
        initialData[ctrl_id] = {
          controlador: ctrlData,

          sensor_temperature: senTemperature,
        };
      }
    });

    return initialData;
  }
}
