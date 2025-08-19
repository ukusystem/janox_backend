import { mqttService } from '../../services/mqtt/MqttService';
import { PinesSalida } from '../../types/db';
import { ControllerMapManager, EquipoSalidaMapManager } from '../maps';

export class PinSalidaNotifyManager {
  static #notifyAlarmActived(ctrl_id: number, curPinSal: PinesSalida, fieldsUpdate: Partial<PinesSalida>, isAdd: boolean, shouldNotify?: boolean) {
    const { estado, activo, es_id, pin } = fieldsUpdate;
    const finalEsId = es_id ?? curPinSal.es_id;
    const finalPin = pin ?? curPinSal.pin;

    const equipoSalida = EquipoSalidaMapManager.getEquipoSalida(finalEsId, true);
    const controller = ControllerMapManager.getController(ctrl_id, true);
    if (equipoSalida === undefined || controller === undefined || curPinSal.activo === 0) {
      return;
    }

    const canNotify = shouldNotify && (activo === undefined || activo === 1) && estado !== undefined && (curPinSal.estado !== estado || isAdd) && estado === 1;
    if (!canNotify) {
      return;
    }

    mqttService.publisAdminNotification({ evento: 'alarm.pinsalida.activated', titulo: 'Actuador Activado', mensaje: `El actuador "${equipoSalida.actuador}" asignado al pin "${finalPin}" del controlador "${controller.nodo}" ha sido activado.` });
  }

  static update(ctrl_id: number, curPinSal: PinesSalida, fieldsUpdate: Partial<PinesSalida>, shouldNotify?: boolean) {
    // notify
    PinSalidaNotifyManager.#notifyAlarmActived(ctrl_id, curPinSal, fieldsUpdate, false, shouldNotify);
  }

  static add(ctrl_id: number, newPinSal: PinesSalida, shouldNotify?: boolean) {
    // notify
    PinSalidaNotifyManager.#notifyAlarmActived(ctrl_id, newPinSal, { estado: newPinSal.estado }, true, shouldNotify);
  }
}
