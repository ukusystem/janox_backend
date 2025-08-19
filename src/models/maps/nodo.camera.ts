import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { Camara } from '../../types/db';
import { Init } from '../init';
import { CameraNotifyManager } from '../system';
import { genericLogger } from '../../services/loggers';

interface CameraRowData extends RowDataPacket, Camara {}

export class NodoCameraMapManager {
  static #camaras: Record<number, Map<number, Camara>> = {};

  static #filterUndefined(data: Partial<Camara>): Partial<Camara> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof Camara;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(ctrl_id: number, newCam: Camara) {
    if (!NodoCameraMapManager.#camaras[ctrl_id]) {
      NodoCameraMapManager.#camaras[ctrl_id] = new Map();
    }

    const hasCamera = NodoCameraMapManager.#camaras[ctrl_id].has(newCam.cmr_id);

    if (!hasCamera) {
      NodoCameraMapManager.#camaras[ctrl_id].set(newCam.cmr_id, newCam);
      CameraNotifyManager.add(ctrl_id, newCam);
    }
  }

  static update(ctrl_id: number, cmr_id_index: number, fieldsUpdate: Partial<Camara>) {
    if (NodoCameraMapManager.#camaras[ctrl_id]) {
      const curCam = NodoCameraMapManager.#camaras[ctrl_id].get(cmr_id_index);
      if (curCam !== undefined) {
        const curCamCopy = { ...curCam };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cmr_id, ...fieldsFiltered } = NodoCameraMapManager.#filterUndefined(fieldsUpdate);
        Object.assign(curCam, fieldsFiltered);
        CameraNotifyManager.update(ctrl_id, curCamCopy, fieldsFiltered);
      }
    }
  }

  static getCamera(ctrl_id: number, cmr_id: number, onlyActive: boolean = true): Camara | undefined {
    if (NodoCameraMapManager.#camaras[ctrl_id]) {
      const camFound = NodoCameraMapManager.#camaras[ctrl_id].get(cmr_id);
      if (camFound !== undefined) {
        if (!onlyActive) {
          return camFound;
        }
        if (camFound.activo === 1) {
          return camFound;
        }
      }
      return undefined;
    }
    return undefined;
  }

  static getCamerasByCtrlID(ctrl_id: number, onlyActive: boolean = true): Camara[] {
    if (NodoCameraMapManager.#camaras[ctrl_id]) {
      const camaras = Array.from(NodoCameraMapManager.#camaras[ctrl_id].values());
      if (!onlyActive) {
        return camaras;
      }
      const activeCameras = camaras.filter((cam) => cam.activo === 1);
      return activeCameras;
    }
    return [];
  }

  static async init() {
    try {
      const region_nodos = await Init.getRegionNodos();
      region_nodos.forEach(async (reg_nodo) => {
        const { ctrl_id, nododb_name } = reg_nodo;
        const cams = await MySQL2.executeQuery<CameraRowData[]>({
          sql: `SELECT * FROM ${nododb_name}.camara WHERE activo = 1`,
        });
        cams.forEach((cam) => {
          NodoCameraMapManager.add(ctrl_id, cam);
        });
      });
    } catch (error) {
      genericLogger.error(`NodoCameraMapManager | Error al inicializar camaras`, error);
      throw error;
    }
  }
}

// (() => {
//   const getRandomBinary = (): 0 | 1 => {
//     return Math.random() < 0.5 ? 0 : 1;
//   };

//   setInterval(() => {
//     const fieldsUpdate: Partial<Camara> = {
//       conectado: getRandomBinary(),
//       activo: 1,
//     };
//     console.log('Actualizando Camara: ', fieldsUpdate);
//     NodoCameraMapManager.update(1, 3, fieldsUpdate);
//   }, 10000);
// })();
