// @ts-nocheck

import { Cam } from 'onvif';
import { NodoCameraMapManager } from '../../maps/nodo.camera';
import { CamImaging, CamMovement, CamOnvifMap, ControlImagingDTO, ControlPTZDTO, CtrlOnvifMap, MovePTZ_DTO, OnvifInstance } from './camera.onvif.types';
import { decrypt } from '../../../utils/decrypt';

export class CameraOnvifManager {
  static #cams: CtrlOnvifMap = new Map();

  static async #getOnvifInstance(ctrl_id: number, cmr_id: number): Promise<OnvifInstance> {
    const onvifCamMap = CameraOnvifManager.#cams.get(ctrl_id);
    if (onvifCamMap !== undefined) {
      const camOnvif = onvifCamMap.get(cmr_id);
      if (camOnvif !== undefined) {
        return camOnvif;
      } else {
        // si no se encuentra crear instancia
        const newCamOnvif = await CameraOnvifManager.#createOnvifInstance(ctrl_id, cmr_id);
        onvifCamMap.set(cmr_id, newCamOnvif);
        return newCamOnvif;
      }
    } else {
      // si no se encuentra crear instancia
      const newCamOnvif = await CameraOnvifManager.#createOnvifInstance(ctrl_id, cmr_id);

      const newOnvifMap: CamOnvifMap = new Map();
      newOnvifMap.set(cmr_id, newCamOnvif);

      CameraOnvifManager.#cams.set(ctrl_id, newOnvifMap);

      return newCamOnvif;
    }
  }

  static async #createOnvifInstance(ctrl_id: number, cmr_id: number): Promise<OnvifInstance> {
    const cam = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
    if (cam !== undefined) {
      const contraseñaDecrypt = decrypt(cam.contraseña);
      return new Promise<Cam>((resolve, reject) => {
        new Cam({ hostname: cam.ip, username: cam.usuario, password: contraseñaDecrypt, timeout: 5000 }, function (err: any) {
          if (err) {
            const errCamConnect = new Error('Error al intentar establecer conexión con la cámara');
            return reject(errCamConnect);
          }
          return resolve(this);
        });
      });
    } else {
      throw new Error('Camara no encontrado');
    }
  }

  static async #movePTZ(ctrl_id: number, cmr_id: number, data: MovePTZ_DTO): Promise<void> {
    const camOnvif = await CameraOnvifManager.#getOnvifInstance(ctrl_id, cmr_id);

    if (camOnvif !== undefined) {
      return new Promise<void>((resolve, reject) => {
        camOnvif.continuousMove({ x: data.x_speed, y: data.y_speed, zoom: data.zoom_speed }, async (err: any) => {
          if (err) {
            const errContiMove = new Error('Se ha producido un error durante el movimiento continuo de la cámara');
            return reject(errContiMove);
          } else {
            return resolve();
          }
        });
      });
    } else {
      throw new Error(`Instancia onvif no encontrado`);
    }
  }

  static async #stopPTZ(ctrl_id: number, cmr_id: number): Promise<void> {
    const camOnvif = await CameraOnvifManager.#getOnvifInstance(ctrl_id, cmr_id);
    if (camOnvif !== undefined) {
      return new Promise<void>((resolve, reject) => {
        camOnvif.stop({ panTilt: true, zoom: true }, function (err: any) {
          if (err) {
            const errStopContMove = new Error('Se ha producido un error al detener el movimiento continuo de la cámara');
            return reject(errStopContMove);
          }
          return resolve();
        });
      });
    } else {
      throw new Error(`Instancia onvif no encontrado`);
    }
  }

  static async presetPTZ(ctrl_id: number, cmr_id: number, n_preset: number): Promise<void> {
    const camOnvif = await CameraOnvifManager.#getOnvifInstance(ctrl_id, cmr_id);
    if (camOnvif !== undefined) {
      return new Promise<void>((resolve, reject) => {
        camOnvif.gotoPreset({ preset: n_preset }, function (err: any, _stream: any, _xml: any) {
          if (err) {
            const errGoPreset = new Error('Error al establecer el preset de la cámara');
            return reject(errGoPreset);
          } else {
            return resolve();
          }
        });
      });
    } else {
      throw new Error(`Instancia onvif no encontrado`);
    }
  }

  static async controlImaging(ctrl_id: number, cmr_id: number, data: ControlImagingDTO): Promise<void> {
    const { velocity, action, movement } = data;
    const camImagings: { [move in CamImaging]: { speed: number } } = {
      FocusFar: { speed: velocity },
      FocusNear: { speed: -velocity },
      IrisLarge: { speed: velocity },
      IrisSmall: { speed: -velocity },
    };

    const movementData = camImagings[movement];
    if (movementData === undefined) {
      throw new Error('El tipo de movimiento de la cámara no está disponible');
    }

    const camOnvif = await CameraOnvifManager.#getOnvifInstance(ctrl_id, cmr_id);

    const videoSourceToken = camOnvif.activeSource?.sourceToken;

    if (!videoSourceToken) {
      throw new Error('No se pudo obtener el token de video source');
    }

    // revisar GetMoveOptions

    if (action === 'start') {
      return new Promise<void>((resolve, reject) => {
        camOnvif.imagingMove(
          {
            token: videoSourceToken,
            continuous: {
              speed: movementData.speed, // Min and Max values defined by the GetMoveOptions if support the continuous movement
            },
          },
          (err: any) => {
            if (err) {
              reject(new Error('Error al mover el enfoque'));
            }
            resolve();
          },
        );
      });
    }

    return new Promise<void>((resolve, reject) => {
      camOnvif.imagingStop({ token: videoSourceToken }, (stopErr: any) => {
        if (stopErr) {
          reject(new Error('Error al detener el enfoque'));
        }
        resolve();
      });
    });
  }

  static async controlPTZ(ctrl_id: number, cmr_id: number, data: ControlPTZDTO): Promise<void> {
    const { action, movement, velocity } = data;
    const movements: { [move in CamMovement]: { x_speed: number; y_speed: number; zoom_speed: number; action: ControlPTZDTO['action']; movement: CamMovement } } = {
      Right: { x_speed: velocity, y_speed: 0, zoom_speed: 0, movement, action },
      Left: { x_speed: -velocity, y_speed: 0, zoom_speed: 0, movement, action },
      Up: { x_speed: 0, y_speed: velocity, zoom_speed: 0, movement, action },
      Down: { x_speed: 0, y_speed: -velocity, zoom_speed: 0, movement, action },
      RightUp: { x_speed: velocity, y_speed: velocity, zoom_speed: 0, movement, action },
      RightDown: { x_speed: velocity, y_speed: -velocity, zoom_speed: 0, movement, action },
      LeftUp: { x_speed: -velocity, y_speed: velocity, zoom_speed: 0, movement, action },
      LeftDown: { x_speed: -velocity, y_speed: -velocity, zoom_speed: 0, movement, action },
      ZoomTele: { x_speed: 0, y_speed: 0, zoom_speed: velocity, movement, action },
      ZoomWide: { x_speed: 0, y_speed: 0, zoom_speed: -velocity, movement, action },
    };

    const movementData = movements[movement];
    if (movementData === undefined) {
      throw new Error('El tipo de movimiento de la cámara no está disponible');
    }

    if (movementData.action === 'start') {
      await CameraOnvifManager.#movePTZ(ctrl_id, cmr_id, movementData); // 400 - 550 ms
    } else if (movementData.action === 'stop') {
      await CameraOnvifManager.#stopPTZ(ctrl_id, cmr_id); // 500-600ms
    }
  }

  static async notifyChangeCamera(ctrl_id: number, cmr_id: number) {
    // delete cam
    const onvifCamMap = CameraOnvifManager.#cams.get(ctrl_id);
    if (onvifCamMap !== undefined) {
      onvifCamMap.delete(cmr_id);
    }
  }
}
