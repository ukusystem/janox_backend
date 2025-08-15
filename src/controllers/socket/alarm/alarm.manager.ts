import { ControllerMapManager, RegionMapManager } from '../../../models/maps';
import { NodoCameraMapManager } from '../../../models/maps/nodo.camera';
import { PinesEntrada, Region } from '../../../types/db';
import { PinEntradaManager } from '../pinentrada';
import { ActionType, AlarmObserver, CameraDataAlarm, ControllerDataAlarm, InitialAlarmData, SocketAlarm } from './alarm.types';

export class AlarmSocketObserver implements AlarmObserver {
  #socket: SocketAlarm;
  constructor(socket: SocketAlarm) {
    this.#socket = socket;
  }
  emitRegion(rgn_id: number, data: Region, action: ActionType): void {
    this.#socket.nsp.emit('region', rgn_id, data, action);
  }

  emitPinEntrada(ctrl_id: number, data: PinesEntrada, action: ActionType): void {
    this.#socket.nsp.emit('pin_entrada', ctrl_id, data, action);
  }
  emitCamera(ctrl_id: number, data: CameraDataAlarm, action: ActionType): void {
    this.#socket.nsp.emit('camera', ctrl_id, data, action);
  }
  emitController(ctrl_id: number, data: ControllerDataAlarm, action: ActionType): void {
    this.#socket.nsp.emit('controller', ctrl_id, data, action);
  }
}

export class AlarmManager {
  static #observer: AlarmObserver | null = null;

  static registerObserver(observer: AlarmObserver): void {
    if (AlarmManager.#observer === null) {
      AlarmManager.#observer = observer;
    }
  }

  static unregisterObserver(): void {
    if (AlarmManager.#observer !== null) {
      AlarmManager.#observer = null;
    }
  }

  static notifyPinEntrada(ctrl_id: number, pe_id: number, action: ActionType): void {
    if (AlarmManager.#observer !== null) {
      const pinEntrada = PinEntradaManager.getPinEntrada(ctrl_id, pe_id);
      if (pinEntrada !== undefined) {
        AlarmManager.#observer.emitPinEntrada(ctrl_id, pinEntrada, action);
      }
    }
  }

  static notifyCamera(ctrl_id: number, cmr_id: number, action: ActionType): void {
    if (AlarmManager.#observer !== null) {
      const cam = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
      if (cam !== undefined) {
        const { activo, conectado, descripcion, tc_id, ip } = cam;
        AlarmManager.#observer.emitCamera(ctrl_id, { activo, cmr_id, conectado, descripcion, tc_id, ip }, action);
        // const tipoCam = TipoCamaraMapManager.getTipoCamara(cam.tc_id);
        // if(tipoCam !== undefined){
        //   const {activo,conectado,descripcion,tc_id} = cam
        //   AlarmManager.#observer.emitCamera(ctrl_id,{activo,cmr_id,conectado,descripcion,tc_id,tipo: tipoCam.tipo},action)
        // }
      }
    }
  }

  static notifyController(ctrl_id: number, action: ActionType): void {
    if (AlarmManager.#observer !== null) {
      const controller = ControllerMapManager.getController(ctrl_id);
      if (controller !== undefined) {
        const { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, direccion } = controller;
        const controllerAlarm: ControllerDataAlarm = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, direccion };
        AlarmManager.#observer.emitController(ctrl_id, controllerAlarm, action);
      }
    }
  }

  static notifyRegion(rgn_id: number, action: ActionType) {
    if (AlarmManager.#observer !== null) {
      const region = RegionMapManager.getRegion(rgn_id);
      if (region !== undefined) {
        AlarmManager.#observer.emitRegion(rgn_id, region, action);
      }
    }
  }

  static getInitialData(): InitialAlarmData {
    const activeControllers = ControllerMapManager.getAllControllers(true);
    const initialData: InitialAlarmData = {};

    activeControllers.forEach((controller) => {
      const { ctrl_id, activo, conectado, descripcion, modo, nodo, rgn_id, seguridad, direccion } = controller;

      // controlador
      const ctrlData: ControllerDataAlarm = { ctrl_id, activo, conectado, descripcion, modo, nodo, rgn_id, seguridad, direccion };

      // camaras
      const camaras = NodoCameraMapManager.getCamerasByCtrlID(ctrl_id);
      const camsData: CameraDataAlarm[] = camaras.map((cam) => {
        const { activo, cmr_id, conectado, descripcion, tc_id, ip } = cam;
        return { activo, cmr_id, conectado, descripcion, tc_id, ip };
      });

      // pines entrada
      const pinesEnt = PinEntradaManager.getListPinesEntrada(ctrl_id);
      const pinsEntData: PinesEntrada[] = pinesEnt.map((pinEnt) => {
        const { activo, descripcion, ee_id, estado, pe_id, pin } = pinEnt;
        return { activo, descripcion, ee_id, estado, pe_id, pin };
      });

      if (!initialData[ctrl_id]) {
        initialData[ctrl_id] = {
          controlador: ctrlData,
          camara: camsData,
          pin_entrada: pinsEntData,
        };
      }
    });

    return initialData;
  }
}
