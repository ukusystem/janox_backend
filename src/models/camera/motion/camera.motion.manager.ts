import { LastSnapShotManager } from '../../../controllers/socket/snapshot';
import { MySQL2 } from '../../../database/mysql';
import { cameraLogger } from '../../../services/loggers';
import { decrypt } from '../../../utils/decrypt';
import { Init } from '../../init';
import { NodoCameraMapManager } from '../../maps/nodo.camera';
import { CameraMotionProcess } from './camera.motion.process';
// import { CameraReconnect } from './camera.motion.reconnect';
import { CameraRowData } from './camera.motion.types';

export class CameraMotionManager {
  static map: { [ctrl_id: number]: { [cmr_id: number]: CameraMotionProcess } } = {};
  static #IS_INIT: boolean = false;

  static get is_init(): boolean {
    return CameraMotionManager.#IS_INIT;
  }

  public static notifyImageMotion(ctrl_id: number, imageBase64: string): void {
    LastSnapShotManager.notifyLastSnapshot(ctrl_id, imageBase64);
  }

  static #exists(props: { ctrl_id: number; cmr_id: number }): boolean {
    const { cmr_id, ctrl_id } = props;

    let is_ctrl_id: boolean = false;
    let is_cmr_id: boolean = false;

    for (const ctrl_id_key in CameraMotionManager.map) {
      if (Number(ctrl_id_key) === ctrl_id) {
        is_ctrl_id = true;
      }
      for (const cmr_id_key in CameraMotionManager.map[ctrl_id_key]) {
        if (Number(cmr_id_key) === cmr_id) {
          is_cmr_id = true;
        }
      }
    }

    return is_ctrl_id && is_cmr_id;
  }

  static #addcam(cam: CameraMotionProcess, execute: boolean = true) {
    if (!CameraMotionManager.map[cam.ctrl_id]) {
      CameraMotionManager.map[cam.ctrl_id] = {};
    }

    if (!CameraMotionManager.map[cam.ctrl_id][cam.cmr_id]) {
      CameraMotionManager.map[cam.ctrl_id][cam.cmr_id] = cam;
      if (execute) {
        try {
          CameraMotionManager.map[cam.ctrl_id][cam.cmr_id].execute();
        } catch (error) {
          cameraLogger.error(`CameraMotionManager | Error #addcam | ctrl_id: ${cam.ctrl_id} | cmr_id: ${cam.cmr_id} | ip: ${cam.ip}`, error);
        }
      }
    }
  }

  static #updatecam(cam: CameraMotionProcess) {
    if (CameraMotionManager.map[cam.ctrl_id]) {
      if (CameraMotionManager.map[cam.ctrl_id][cam.cmr_id]) {
        const curCamMotion = CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];
        if (curCamMotion.ip !== cam.ip || curCamMotion.contraseña !== cam.contraseña || curCamMotion.usuario !== cam.usuario) {
          if (curCamMotion.ffmpegProcess !== undefined) {
            if (curCamMotion.ffmpegProcess && curCamMotion.ffmpegProcess.pid !== undefined) {
              try {
                curCamMotion.ffmpegProcess.kill();
              } catch (error) {
                cameraLogger.error(`CameraMotionManager | #updatecam | Error kill process | ctrl_id = ${curCamMotion.ctrl_id} , cmr_id = ${curCamMotion.cmr_id}`, error);
              }
            }
          }

          delete CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];
          // Agregar nuevo
          CameraMotionManager.#addcam(cam);
        }
      }
    }
  }

  static notifyAddUpdate(ctrl_id: number, cmr_id: number, execute: boolean = true) {
    const cam = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
    const exists = CameraMotionManager.#exists({ ctrl_id, cmr_id });
    if (cam !== undefined) {
      try {
        const contDecript = decrypt(cam.contraseña);
        const newCamMot = new CameraMotionProcess({
          ip: cam.ip,
          usuario: cam.usuario,
          contraseña: contDecript,
          cmr_id: cam.cmr_id,
          ctrl_id: ctrl_id,
        });
        cameraLogger.info(`CameraMotionManager | notifyAddUpdate | ctrl_id:${ctrl_id} cmr_id:${cmr_id}`);
        if (exists) {
          CameraMotionManager.#updatecam(newCamMot);
        } else {
          CameraMotionManager.#addcam(newCamMot, execute);
        }
      } catch (error) {
        cameraLogger.error(`CameraMotionManager | notifyAddUpdate | ctrl_id:${ctrl_id} cmr_id:${cmr_id}`, error);
      }
    }
  }

  static notifyDelete(ctrl_id: number, cmr_id: number) {
    if (CameraMotionManager.map[ctrl_id]) {
      if (CameraMotionManager.map[ctrl_id][cmr_id]) {
        const currentCamMot = CameraMotionManager.map[ctrl_id][cmr_id];
        if (currentCamMot.ffmpegProcess !== undefined) {
          if (currentCamMot.ffmpegProcess && currentCamMot.ffmpegProcess.pid !== undefined) {
            try {
              currentCamMot.ffmpegProcess.kill();
            } catch (error) {
              cameraLogger.error(`CameraMotionManager | notifyDelete | Error kill process | ctrl_id = ${ctrl_id} , cmr_id = ${cmr_id}`, error);
            }
          }
        }
        delete CameraMotionManager.map[ctrl_id][cmr_id];
      }
    }
  }

  static async notifyReconnect(ctrl_id: number, cmr_id: number) {
    cameraLogger.info(`CameraMotionManager | reconnect | ctrl_id : ${ctrl_id} | cmr_id: ${cmr_id} `);

    if (CameraMotionManager.#exists({ ctrl_id, cmr_id })) {
      const currCamMotion = CameraMotionManager.map[ctrl_id][cmr_id];
      // const cur_cmr_id = currCamMotion.cmr_id;
      // const cur_ctrl_id = currCamMotion.ctrl_id;
      // const cur_ip = currCamMotion.ip;
      // const cur_contraseña = currCamMotion.contraseña;
      // const cur_usuario = currCamMotion.usuario;

      if (currCamMotion.ffmpegProcess !== undefined) {
        if (currCamMotion.ffmpegProcess && currCamMotion.ffmpegProcess.pid !== undefined) {
          try {
            currCamMotion.ffmpegProcess.kill();
          } catch (error) {
            cameraLogger.error(`CameraMotionManager | notifyReconnect | Error kill process | ctrl_id = ${ctrl_id} , cmr_id = ${cmr_id}`, error);
          }
        }
      }

      delete CameraMotionManager.map[ctrl_id][cmr_id];

      // const newCamRec = new CameraReconnect({
      //   cmr_id: cur_cmr_id,
      //   ctrl_id: cur_ctrl_id,
      //   ip: cur_ip,
      //   contraseña: cur_contraseña,
      //   usuario: cur_usuario,
      // });

      // await newCamRec.execute();
      CameraMotionManager.notifyAddUpdate(ctrl_id, cmr_id);
    }
  }

  static deleteFfmpegProccess(cmr_id: number, ctrl_id: number) {
    cameraLogger.info(`CameraMotionManager | deleteFfmpegProccess | ctrl_id : ${ctrl_id} | cmr_id: ${cmr_id} `);

    if (CameraMotionManager.map[ctrl_id]) {
      if (CameraMotionManager.map[ctrl_id][cmr_id]) {
        const currentCamMot = CameraMotionManager.map[ctrl_id][cmr_id];

        if (currentCamMot.ffmpegProcess !== undefined) {
          if (currentCamMot.ffmpegProcess && currentCamMot.ffmpegProcess.pid !== undefined) {
            try {
              currentCamMot.ffmpegProcess.kill();
            } catch (error) {
              cameraLogger.error(`CameraMotionManager | deleteFfmpegProccess | Error kill process | ctrl_id = ${ctrl_id} , cmr_id = ${cmr_id}`, error);
            }
          }
        }

        // delete CameraMotionManager.map[ctrl_id][cmr_id];
      }
    }
  }

  static async init() {
    try {
      const regionNodos = await Init.getRegionNodos();

      regionNodos.forEach(async ({ ctrl_id, nododb_name }) => {
        try {
          const camaras = await MySQL2.executeQuery<CameraRowData[]>({
            sql: `SELECT * FROM ${nododb_name}.camara c WHERE c.activo = 1`,
          });

          for (const cam of camaras) {
            CameraMotionManager.notifyAddUpdate(ctrl_id, cam.cmr_id, true);
          }
        } catch (error) {
          cameraLogger.error(`CameraMotionManager | Error al inicializar deteccion de movimiento | ctrl_id : ${ctrl_id}`, error);
        }
      });

      CameraMotionManager.#IS_INIT = true;
    } catch (error) {
      cameraLogger.error(`CameraMotionManager | Error al inicializar deteccion de movimiento`, error);
      throw error;
    }
  }
}
