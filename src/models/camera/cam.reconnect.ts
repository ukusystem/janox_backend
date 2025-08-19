// @ts-ignore
// @ts-nocheck

import { genericLogger } from '../../services/loggers';
import { decrypt } from '../../utils/decrypt';
import { NodoCameraMapManager } from '../maps/nodo.camera';

import { Cam } from 'onvif';

type TypeReconnect = 'Nvr' | 'MotionSnapshot' | 'MotionRecord' | 'Motion';
interface CameraReconnectProps {
  ctrl_id: number;
  cmr_id: number;
  type: TypeReconnect;
}

export class CameraReconnect implements CameraReconnectProps {
  readonly ctrl_id: number;
  readonly cmr_id: number;
  readonly type: TypeReconnect;

  #interval: NodeJS.Timeout | undefined;

  constructor(ctrl_id: CameraReconnectProps['ctrl_id'], cmr_id: CameraReconnectProps['cmr_id'], type: CameraReconnectProps['type']) {
    this.ctrl_id = ctrl_id;
    this.cmr_id = cmr_id;
    this.type = type;
  }

  start() {
    const ctrl_id = this.ctrl_id;
    const cmr_id = this.cmr_id;
    const type = this.type;

    this.#interval = setInterval(async () => {
      const camera = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
      if (camera !== undefined) {
        try {
          const contraseñaDecrypt = decrypt(camera.contraseña);
          genericLogger.debug(`CameraConnect | ${type} | Connecting ... | ctrl_id : ${ctrl_id} | cmr_id : ${cmr_id}`);
          const isConnected = await CameraReconnect.#connect(camera.ip, camera.usuario, contraseñaDecrypt);
          if (isConnected) {
            // notify cam connect
            if (camera.conectado === 0) {
              NodoCameraMapManager.update(ctrl_id, cmr_id, { conectado: 1 });
            }

            // delete interval
            this.#deleteInterval();
          }
        } catch (error) {
          genericLogger.error(`CameraConnect | ${type}  | Error | ctrl_id : ${ctrl_id} | cmr_id : ${cmr_id}`, error);
          // delete interval
          this.#deleteInterval();
        }
      } else {
        // delete interval
        this.#deleteInterval();
      }
    }, 10000);
  }

  static #connect(ip: string, usuario: string, contraseña: string): Promise<boolean> {
    const camOvifProps = {
      hostname: ip,
      username: usuario,
      password: contraseña,
      timeout: 5000,
      preserveAddress: false,
      autoconnect: true,
    };

    return new Promise<boolean>((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Cam(camOvifProps, function (err: any) {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  #deleteInterval(): void {
    if (this.#interval) {
      clearInterval(this.#interval);
      genericLogger.info(`CameraConnect | ${this.type}  | DeleteInterval | ctrl_id : ${this.ctrl_id} | cmr_id : ${this.cmr_id}`);
    }
  }

  // static async status(ctrl_id: number, cmr_id: number): Promise<boolean> {
  //   const camera = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
  //   if (camera !== undefined) {
  //     const contraseñaDecrypt = decrypt(camera.contraseña);
  //     const isConnected = await CameraReconnect.#connect(camera.ip, camera.usuario, contraseñaDecrypt);
  //     return isConnected;
  //   } else {
  //     throw new Error(`CameraConnect | Camera not found | ctrl_id : ${ctrl_id} | cmr_id: ${cmr_id}`);
  //   }
  // }
}
