import { MySQL2 } from '../../../database/mysql';
import { genericLogger } from '../../../services/loggers';
import { Controlador } from '../../../types/db';
import { filterUndefined } from '../../../utils/filterUndefined';
import { ControllerNotifyManager } from '../../system';
import { RegionMapManager } from '../region';
import { ResolutionMapManager } from '../resolucion';
import { ControllerAndResolution, ControllerData, ControllerRowData, ControllerState, UpdateControllerResolution } from './controller.map.types';

export class ControllerMapManager {
  static #controllers: Map<number, ControllerData> = new Map();

  static #updateResolution(resUpdates: UpdateControllerResolution, curController: Controlador): UpdateControllerResolution {
    const updateResolution: Record<any, any> = {};
    for (const key in resUpdates) {
      const key_assert = key as keyof UpdateControllerResolution;
      if (resUpdates[key_assert] !== undefined) {
        const new_res_id = resUpdates[key_assert];
        const resulucion = ResolutionMapManager.getResolution(new_res_id as number);
        if (resulucion !== undefined) {
          Object.assign(curController, { [key_assert]: resUpdates[key_assert] });
          updateResolution[key_assert] = resUpdates[key_assert];
        }
      }
    }
    return updateResolution;
  }

  static getAllControllers(active: boolean = false): ControllerData[] {
    const controllers = Array.from(ControllerMapManager.#controllers.values());
    if (!active) return controllers;
    const activeControllers = controllers.filter((controller) => controller.activo === ControllerState.Activo);
    return activeControllers;
  }

  static getController(ctrl_id: number, active: boolean = false): ControllerData | undefined {
    const controller = ControllerMapManager.#controllers.get(ctrl_id);
    if (controller === undefined) {
      return undefined;
    }

    if (!active) {
      return controller;
    }

    const isActiveController = controller.activo === ControllerState.Activo;

    if (isActiveController) {
      return controller;
    }

    return undefined;
  }

  static getControllerAndResolution(ctrl_id: number): ControllerAndResolution | undefined {
    const controller = ControllerMapManager.#controllers.get(ctrl_id);
    if (controller === undefined) {
      return undefined;
    }
    const resMotionRecord = ResolutionMapManager.getResolution(controller.res_id_motionrecord);
    const resMotionSnapshot = ResolutionMapManager.getResolution(controller.res_id_motionsnapshot);
    const resStreamAux = ResolutionMapManager.getResolution(controller.res_id_streamauxiliary);
    const resStreamPri = ResolutionMapManager.getResolution(controller.res_id_streamprimary);
    const resStreamSec = ResolutionMapManager.getResolution(controller.res_id_streamsecondary);

    if (resMotionRecord !== undefined && resMotionSnapshot !== undefined && resStreamAux !== undefined && resStreamPri !== undefined && resStreamSec !== undefined) {
      const result: ControllerAndResolution = {
        controller,
        resolution: {
          motion_record: resMotionRecord,
          motion_snapshot: resMotionSnapshot,
          stream_aux: resStreamAux,
          stream_pri: resStreamPri,
          stream_sec: resStreamSec,
        },
      };
      return result;
    }

    return undefined;
  }

  static add(ctrl_id: number, newController: ControllerData): void {
    const existController = ControllerMapManager.#controllers.has(ctrl_id);
    if (!existController) {
      ControllerMapManager.#controllers.set(ctrl_id, newController);
      ControllerNotifyManager.add(newController);
    }
  }

  static update(ctrl_id_update: number, fieldsUpdate: Partial<ControllerData>): void {
    const currController = ControllerMapManager.#controllers.get(ctrl_id_update);
    if (currController !== undefined) {
      const curControllerCopy = { ...currController };
      const fieldsFiltered = filterUndefined<ControllerData>(fieldsUpdate);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { res_id_motionrecord, res_id_motionsnapshot, res_id_streamauxiliary, res_id_streamprimary, res_id_streamsecondary, ctrl_id, rgn_id, ...rest } = fieldsFiltered;
      const resolutionFieldsUpdate = ControllerMapManager.#updateResolution({ res_id_motionrecord, res_id_motionsnapshot, res_id_streamauxiliary, res_id_streamprimary, res_id_streamsecondary }, currController);

      const regFieldUpdate: { rgn_id?: number | undefined } = {};
      if (rgn_id !== undefined) {
        const region = RegionMapManager.getRegion(rgn_id);
        if (region !== undefined) {
          regFieldUpdate.rgn_id = rgn_id;
        }
      }
      const finalFieldsUpdate = { ...rest, ...regFieldUpdate, ...resolutionFieldsUpdate };
      Object.assign(currController, finalFieldsUpdate);
      ControllerNotifyManager.update(curControllerCopy, finalFieldsUpdate);
    }
  }

  static delete(ctrl_id: number): boolean {
    const controllerFound = ControllerMapManager.#controllers.get(ctrl_id);
    if (controllerFound) {
      ControllerMapManager.#controllers.delete(ctrl_id);
      ControllerNotifyManager.delete(controllerFound);
      return true;
    }

    return false;
  }

  static async init() {
    try {
      const controllers = await MySQL2.executeQuery<ControllerRowData[]>({
        sql: `SELECT * FROM general.controlador WHERE activo = 1`,
      });
      controllers.forEach((controller) => {
        ControllerMapManager.add(controller.ctrl_id, controller);
      });
    } catch (error) {
      genericLogger.error(`ControllerMapManager | init | Error al inicializar controladores`, error);
      throw error;
    }
  }
}
