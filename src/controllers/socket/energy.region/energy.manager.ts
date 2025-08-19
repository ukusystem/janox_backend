import { ControllerMapManager, RegionMapManager } from '../../../models/maps';
import { Region } from '../../../types/db';
import { MedidorEnergiaManager } from '../energia';
import { ControllerDataEnergy, EnergyActionType, EnergyObserver, EnergySocketDTO, InitialDataEnergy, SocketEnergy } from './energy.types';

export class EnergyObserverImp implements EnergyObserver {
  #socket: SocketEnergy;
  constructor(socket: SocketEnergy) {
    this.#socket = socket;
  }
  emitEnergy(ctrl_id: number, data: EnergySocketDTO, action: EnergyActionType): void {
    this.#socket.nsp.emit('energy', ctrl_id, data, action);
  }
  emitController(ctrl_id: number, data: ControllerDataEnergy, action: EnergyActionType): void {
    this.#socket.nsp.emit('controller', ctrl_id, data, action);
  }
  emitRegion(rgn_id: number, data: Region, action: EnergyActionType): void {
    this.#socket.nsp.emit('region', rgn_id, data, action);
  }
}

export class EnergyManager {
  static #observer: EnergyObserver | null = null;

  static registerObserver(new_observer: EnergyObserver): void {
    if (EnergyManager.#observer === null) {
      EnergyManager.#observer = new_observer;
    }
  }

  static unregisterObserver(): void {
    if (EnergyManager.#observer !== null) {
      EnergyManager.#observer = null;
    }
  }

  static notifyEnergy(ctrl_id: number, data: EnergySocketDTO, action: EnergyActionType): void {
    if (EnergyManager.#observer !== null) {
      EnergyManager.#observer.emitEnergy(ctrl_id, data, action);
    }
  }

  static notifyController(ctrl_id: number, data: ControllerDataEnergy, action: EnergyActionType): void {
    if (EnergyManager.#observer !== null) {
      // const controller = ControllerMapManager.getController(ctrl_id);
      // if (controller !== undefined) {
      //   const { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, direccion } = controller;
      //   const controllerAlarm: ControllerDataEnergy = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, direccion };
      //   EnergyManager.#observer.emitController(ctrl_id, controllerAlarm, action);
      // }
      EnergyManager.#observer.emitController(ctrl_id, data, action);
    }
  }

  static notifyRegion(rgn_id: number, action: EnergyActionType): void {
    if (EnergyManager.#observer !== null) {
      const region = RegionMapManager.getRegion(rgn_id);
      if (region !== undefined) {
        EnergyManager.#observer.emitRegion(rgn_id, region, action);
      }
    }
  }

  static getInitialData(): InitialDataEnergy {
    const activeControllers = ControllerMapManager.getAllControllers(true);
    const initialData: InitialDataEnergy = {};

    activeControllers.forEach((controller) => {
      const { ctrl_id, activo, conectado, descripcion, modo, nodo, rgn_id, seguridad, direccion } = controller;

      // controlador
      const ctrlData: ControllerDataEnergy = { ctrl_id, activo, conectado, descripcion, modo, nodo, rgn_id, seguridad, direccion };

      // modulo energia
      const modEnergy = MedidorEnergiaManager.getListMedEnergia(ctrl_id);

      if (!initialData[ctrl_id]) {
        initialData[ctrl_id] = {
          controlador: ctrlData,
          module_energy: modEnergy,
        };
      }
    });

    return initialData;
  }
}
