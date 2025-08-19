import { appConfig } from '../../configs';
import { AlarmManager } from '../../controllers/socket';
import { mqttService } from '../../services/mqtt/MqttService';
import { Camara } from '../../types/db';
import { CameraMotionManager } from '../camera';
import { CameraOnvifManager } from '../camera/onvif/camera.onvif.manager';
import { ControllerMapManager } from '../maps';
import { NvrManager } from '../nvr';

export class CameraNotifyManager {
  static #notifyUpdateToAlarm(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    const { conectado, descripcion, tc_id, activo, ip } = fieldsUpdate;
    const hasChanges = (conectado !== undefined && curCam.conectado !== conectado) || (descripcion !== undefined && curCam.descripcion !== descripcion) || (tc_id !== undefined && curCam.tc_id !== tc_id) || (activo !== undefined && curCam.activo !== activo) || (ip !== undefined && curCam.ip !== ip);

    if (hasChanges) {
      AlarmManager.notifyCamera(ctrl_id, curCam.cmr_id, 'update');
    }
  }

  static #notifyAddToAlarm(ctrl_id: number, newCam: Camara) {
    AlarmManager.notifyCamera(ctrl_id, newCam.cmr_id, 'add');
  }

  static #notifyUpdateToNvr(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    const { usuario, contraseña, ip, conectado, activo } = fieldsUpdate;
    const hasChanges = (usuario !== undefined && curCam.usuario !== usuario) || (contraseña !== undefined && curCam.contraseña !== contraseña) || (ip !== undefined && curCam.ip !== ip) || (conectado !== undefined && curCam.conectado !== conectado && conectado === 1);

    const hasDelete = activo !== undefined && curCam.activo !== activo && activo === 0;

    if (hasChanges) {
      NvrManager.notifyUpdateCamera(ctrl_id, curCam.cmr_id);
    }

    if (hasDelete) {
      NvrManager.notifyDeleteCamera(ctrl_id, curCam.cmr_id);
    }
  }

  static #notifyUpdateToMotion(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    const { usuario, contraseña, ip } = fieldsUpdate;
    const hasChanges = (usuario !== undefined && curCam.usuario !== usuario) || (contraseña !== undefined && curCam.contraseña !== contraseña) || (ip !== undefined && curCam.ip !== ip);

    if (hasChanges) {
      CameraMotionManager.notifyAddUpdate(ctrl_id, curCam.cmr_id);
    }
  }

  static #notifyDeleteToMotion(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    const { activo } = fieldsUpdate;
    const hasDelete = activo !== undefined && curCam.activo !== activo && activo === 0;
    if (hasDelete) {
      CameraMotionManager.notifyDelete(ctrl_id, curCam.cmr_id);
    }
  }

  static #notifyReconnectToMotion(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    const { conectado } = fieldsUpdate;
    const hasConnected = conectado !== undefined && curCam.conectado !== conectado && conectado === 1;
    if (hasConnected) {
      CameraMotionManager.notifyReconnect(ctrl_id, curCam.cmr_id);
    }
  }

  static #notifyUpdateToOnvif(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    const { ip, usuario, contraseña } = fieldsUpdate;
    const hasChanges = (ip !== undefined && curCam.ip !== ip) || (usuario !== undefined && curCam.usuario !== usuario) || (contraseña !== undefined && curCam.contraseña !== contraseña);
    if (hasChanges) {
      CameraOnvifManager.notifyChangeCamera(ctrl_id, curCam.cmr_id);
    }
  }

  static #notifyDisconnect(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>, isAdd: boolean) {
    const { conectado, activo } = fieldsUpdate;
    const controller = ControllerMapManager.getController(ctrl_id, true);
    if (controller !== undefined && curCam.activo === 1) {
      const canNotify = (activo === undefined || activo === 1) && conectado !== undefined && (curCam.conectado !== conectado || isAdd) && conectado === 0;
      if (canNotify) {
        mqttService.publisAdminNotification({ evento: 'alarm.camera.disconnected', titulo: 'Camara desconectado', mensaje: `La camara "${curCam.descripcion}" del controlador "${controller.nodo}" se ha desconectado. Verifica su estado y conexión de red.` });
      }
    }
  }

  static update(ctrl_id: number, curCam: Camara, fieldsUpdate: Partial<Camara>) {
    // notify Alarm
    CameraNotifyManager.#notifyUpdateToAlarm(ctrl_id, curCam, fieldsUpdate);
    // notify NVR
    if (appConfig.system.start_nvr && NvrManager.is_init) {
      CameraNotifyManager.#notifyUpdateToNvr(ctrl_id, curCam, fieldsUpdate);
    }
    // notify Motion
    if ((appConfig.system.start_record_motion || appConfig.system.start_snapshot_motion) && CameraMotionManager.is_init) {
      CameraNotifyManager.#notifyUpdateToMotion(ctrl_id, curCam, fieldsUpdate);
      CameraNotifyManager.#notifyDeleteToMotion(ctrl_id, curCam, fieldsUpdate);
      CameraNotifyManager.#notifyReconnectToMotion(ctrl_id, curCam, fieldsUpdate);
    }

    // notify to Onvif:
    CameraNotifyManager.#notifyUpdateToOnvif(ctrl_id, curCam, fieldsUpdate);

    // alarm disconnect notify:
    CameraNotifyManager.#notifyDisconnect(ctrl_id, curCam, fieldsUpdate, false);
  }

  static add(ctrl_id: number, newCam: Camara) {
    // notify Alarm
    CameraNotifyManager.#notifyAddToAlarm(ctrl_id, newCam);
    // notify Motion
    if ((appConfig.system.start_record_motion || appConfig.system.start_snapshot_motion) && CameraMotionManager.is_init) {
      CameraMotionManager.notifyAddUpdate(ctrl_id, newCam.cmr_id);
    }

    // alarm disconnect notify:
    CameraNotifyManager.#notifyDisconnect(ctrl_id, newCam, { conectado: newCam.conectado }, true);
  }
}
