import { mqttService } from '../../services/mqtt/MqttService';
import { PinesEntrada } from '../../types/db';
import { ControllerMapManager, EquipoEntradaMapManager } from '../maps';
import { ControllerMode, ControllerSecurity } from './system.state.types';

export class PinEntradaNotifyManager {
  static #notifyActiveDetectetor(ctrl_id: number, curPinEnt: PinesEntrada, fieldsUpdate: Partial<PinesEntrada>, isAdd: boolean) {
    const { estado, activo, ee_id, pin } = fieldsUpdate;
    const finalEeId = ee_id ?? curPinEnt.ee_id;
    const finalPin = pin ?? curPinEnt.pin;
    const equipoEntrada = EquipoEntradaMapManager.getEquipoEntrada(finalEeId, true);
    const controller = ControllerMapManager.getController(ctrl_id, true);
    if (controller !== undefined && equipoEntrada !== undefined && curPinEnt.activo === 1) {
      if (controller.modo === ControllerMode.Seguridad && controller.seguridad === ControllerSecurity.Armado) {
        const canNotify = (activo === undefined || activo === 1) && estado !== undefined && (curPinEnt.estado !== estado || isAdd) && estado === 1;
        if (canNotify) {
          mqttService.publisAdminNotification({ evento: 'alarm.pinentrada.activated', titulo: 'Detector Activado', mensaje: `El detector "${equipoEntrada.detector}" asignado al pin "${finalPin}" del controlador "${controller.nodo}" ha sido activado.` });
        }
      }
    }
  }

  static update(ctrl_id: number, curPinEnt: PinesEntrada, fieldsUpdate: Partial<PinesEntrada>) {
    // notify
    PinEntradaNotifyManager.#notifyActiveDetectetor(ctrl_id, curPinEnt, fieldsUpdate, false);
  }

  static add(ctrl_id: number, newPinEnt: PinesEntrada) {
    // notify
    PinEntradaNotifyManager.#notifyActiveDetectetor(ctrl_id, newPinEnt, { estado: newPinEnt.estado }, true);
  }
}
