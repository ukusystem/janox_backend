import { AlarmManager, CamStreamQuality, CamStreamSocketManager, ControllerStateManager, PinEntradaManager, SidebarNavManager } from '../../controllers/socket';
import { EnergyManager } from '../../controllers/socket/energy.region/energy.manager';
import { TemperatureManager } from '../../controllers/socket/temperature.region/temperature.manager';
import { mqttService } from '../../services/mqtt/MqttService';
import { Controlador } from '../../types/db';
import { filterUndefined } from '../../utils/filterUndefined';

export class ControllerNotifyManager {
  static #notifyUpdateToStream(curController: Controlador, fieldsUpdate: Partial<Controlador>) {
    const { res_id_streamprimary, res_id_streamsecondary, res_id_streamauxiliary } = fieldsUpdate;
    const { streamprimaryfps, streamsecondaryfps, streamauxiliaryfps } = fieldsUpdate;

    // primary stream
    const hasChangeStremaPri = (res_id_streamprimary !== undefined && curController.res_id_streamprimary !== res_id_streamprimary) || (streamprimaryfps !== undefined && curController.streamprimaryfps !== streamprimaryfps);
    if (hasChangeStremaPri) {
      CamStreamSocketManager.notifyChangeConfig(curController.ctrl_id, CamStreamQuality.Primary);
    }

    // secondary stream
    const hasChangeStremaSec = (res_id_streamsecondary !== undefined && curController.res_id_streamsecondary !== res_id_streamsecondary) || (streamsecondaryfps !== undefined && curController.streamsecondaryfps !== streamsecondaryfps);
    if (hasChangeStremaSec) {
      CamStreamSocketManager.notifyChangeConfig(curController.ctrl_id, CamStreamQuality.Secondary);
    }

    // Auxiliary stream
    const hasChangeStremaAux = (res_id_streamauxiliary !== undefined && curController.res_id_streamauxiliary !== res_id_streamauxiliary) || (streamauxiliaryfps !== undefined && curController.streamauxiliaryfps !== streamauxiliaryfps);
    if (hasChangeStremaAux) {
      CamStreamSocketManager.notifyChangeConfig(curController.ctrl_id, CamStreamQuality.Auxiliary);
    }
  }

  static #notifyUpdateToSidebarNav(curController: Controlador, fieldsUpdate: Partial<Controlador>) {
    const { activo, rgn_id, nodo, conectado, seguridad, modo, descripcion } = fieldsUpdate;
    const hasChangesSidebarNav =
      (activo !== undefined && curController.activo !== activo) ||
      (rgn_id !== undefined && curController.rgn_id !== rgn_id) ||
      (nodo !== undefined && curController.nodo !== nodo) ||
      (conectado !== undefined && curController.conectado !== conectado) ||
      (seguridad !== undefined && curController.seguridad !== seguridad) ||
      (modo !== undefined && curController.modo !== modo) ||
      (descripcion !== undefined && curController.descripcion !== descripcion);

    if (hasChangesSidebarNav) {
      SidebarNavManager.notifyUpdateController(curController.ctrl_id);
    }
  }

  static #notifyUpdateToPinEntrada(curController: Controlador, fieldsUpdate: Partial<Controlador>) {
    const { seguridad, modo } = fieldsUpdate;
    if (modo !== undefined && curController.modo !== modo) {
      PinEntradaManager.notifyControllerMode(curController.ctrl_id, modo);
    }

    if (seguridad !== undefined && curController.seguridad !== seguridad) {
      PinEntradaManager.notifyControllerSecurity(curController.ctrl_id, seguridad);
    }
  }

  static #notifyUpdateToControllerState(curController: Controlador, fieldsUpdate: Partial<Controlador>) {
    const { seguridad, modo, conectado, rgn_id, nodo, descripcion, activo } = fieldsUpdate;
    const hasChanges =
      (nodo !== undefined && curController.nodo !== nodo) ||
      (rgn_id !== undefined && curController.rgn_id !== rgn_id) ||
      (descripcion !== undefined && curController.descripcion !== descripcion) ||
      (seguridad !== undefined && curController.seguridad !== seguridad) ||
      (modo !== undefined && curController.modo !== modo) ||
      (conectado !== undefined && curController.conectado !== conectado) ||
      (activo !== undefined && curController.activo !== activo);

    if (hasChanges) {
      ControllerStateManager.notifyUpdateController(curController.ctrl_id);
    }
  }

  static #notifyUpdateToAlarm(curController: Controlador, fieldsUpdate: Partial<Controlador>) {
    const { nodo, seguridad, conectado, modo, activo } = fieldsUpdate;

    const hasChanges =
      (nodo !== undefined && curController.nodo !== nodo) ||
      // (descripcion !== undefined && curController.descripcion !== descripcion) ||
      (seguridad !== undefined && curController.seguridad !== seguridad) ||
      (modo !== undefined && curController.modo !== modo) ||
      (conectado !== undefined && curController.conectado !== conectado) ||
      (activo !== undefined && curController.activo !== activo);

    if (hasChanges) {
      const newController = { ...curController };
      Object.assign(newController, filterUndefined(filterUndefined));

      const controllerNotify = {
        activo: newController.activo,
        conectado: newController.conectado,
        ctrl_id: newController.ctrl_id,
        descripcion: newController.descripcion,
        direccion: newController.direccion,
        modo: newController.modo,
        nodo: newController.nodo,
        rgn_id: newController.rgn_id,
        seguridad: newController.seguridad,
      };
      AlarmManager.notifyController(curController.ctrl_id, 'update');
      TemperatureManager.notifyController(curController.ctrl_id, controllerNotify, 'update');
      EnergyManager.notifyController(curController.ctrl_id, controllerNotify, 'update');
    }
  }

  static #notifyDisconnect(curController: Controlador, fieldsUpdate: Partial<Controlador>, isAdd: boolean) {
    const { conectado, activo } = fieldsUpdate;
    if (curController.activo === 1) {
      const canNotify = (activo === undefined || activo === 1) && conectado !== undefined && (curController.conectado !== conectado || isAdd) && conectado === 0;
      if (canNotify) {
        mqttService.publisAdminNotification({ evento: 'alarm.controller.disconnected', titulo: 'Controlador desconectado', mensaje: `El controlador "${curController.nodo}" se ha desconectado. Verifica su estado y conexión de red.` });
      }
    }
  }

  static update(curController: Controlador, fieldsUpdate: Partial<Controlador>) {
    // stream
    ControllerNotifyManager.#notifyUpdateToStream(curController, fieldsUpdate);
    // sidebar_nav
    ControllerNotifyManager.#notifyUpdateToSidebarNav(curController, fieldsUpdate);
    // pin entrada
    ControllerNotifyManager.#notifyUpdateToPinEntrada(curController, fieldsUpdate);
    // ControllerState
    ControllerNotifyManager.#notifyUpdateToControllerState(curController, fieldsUpdate);
    // Alarm
    ControllerNotifyManager.#notifyUpdateToAlarm(curController, fieldsUpdate);
    // Notification: disconnect
    ControllerNotifyManager.#notifyDisconnect(curController, fieldsUpdate, false);
  }

  static add(newController: Controlador) {
    // sidebar_nav
    SidebarNavManager.notifyAddController(newController.ctrl_id);
    // Notification: disconnect
    ControllerNotifyManager.#notifyDisconnect(newController, { conectado: newController.conectado }, true);

    const controllerNotify = {
      activo: newController.activo,
      conectado: newController.conectado,
      ctrl_id: newController.ctrl_id,
      descripcion: newController.descripcion,
      direccion: newController.direccion,
      modo: newController.modo,
      nodo: newController.nodo,
      rgn_id: newController.rgn_id,
      seguridad: newController.seguridad,
    };

    TemperatureManager.notifyController(newController.ctrl_id, controllerNotify, 'add');
    EnergyManager.notifyController(newController.ctrl_id, controllerNotify, 'add');
  }

  static delete(controller: Controlador) {
    const controllerNotify = {
      activo: controller.activo,
      conectado: controller.conectado,
      ctrl_id: controller.ctrl_id,
      descripcion: controller.descripcion,
      direccion: controller.direccion,
      modo: controller.modo,
      nodo: controller.nodo,
      rgn_id: controller.rgn_id,
      seguridad: controller.seguridad,
    };
    TemperatureManager.notifyController(controller.ctrl_id, controllerNotify, 'delete');
    EnergyManager.notifyController(controller.ctrl_id, controllerNotify, 'delete');
  }
}
