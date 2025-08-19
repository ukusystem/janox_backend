import { RowDataPacket } from 'mysql2';
import { NodoCameraMapManager } from '../maps/nodo.camera';
import { MySQL2 } from '../../database/mysql';
import { Camara, Controlador, Marca, TipoCamara } from '../../types/db';
import { handleErrorWithArgument, handleErrorWithoutArgument } from '../../utils/simpleErrorHandler';
import { Init } from '../init';
import { getRstpLinksByCtrlIdAndCmrId } from '../../utils/getCameraRtspLinks';
import { ChildProcessByStdio, spawn } from 'child_process';
import { verifyImageMarkers } from '../../utils/stream';
import { CustomError } from '../../utils/CustomError';
import { cameraLogger } from '../../services/loggers';
import { CameraOnvifManager } from './onvif/camera.onvif.manager';
import { ControlImagingDTO, ControlPTZDTO } from './onvif/camera.onvif.types';

type CameraInfo = Pick<Camara, 'cmr_id' | 'ip' | 'descripcion' | 'puertows' | 'tc_id'> & Pick<TipoCamara, 'tipo'> & Pick<Marca, 'marca'>;

interface CameraInfoRowData extends RowDataPacket, CameraInfo {}

interface CamIdentifier {
  ctrl_id: number;
  cmr_id: number;
}

type CamResponse = Record<
  number,
  {
    rgn_id: number;
    region: string;
    controllers: Record<
      number,
      {
        ctrl_id: number;
        nodo: string;
        camaras: (CameraInfo & Pick<Controlador, 'ctrl_id' | 'nodo' | 'rgn_id'> & { region: string })[];
      }
    >;
  }
>;

export class Camera {
	static #snapshotViaHttp = (ip: string, user: string, pass: string): Promise<Buffer> => {
		// Se intenta obtener la captura por HTTP, un método mucho más rápido.
		return new Promise(async (resolve, reject) => {
			const snapshotUrl = `http://${ip}/cgi-bin/snapshot.cgi?user=${user}&pwd=${pass}`;
			try {
				const response = await fetch(snapshotUrl);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const arrayBuffer = await response.arrayBuffer();
				resolve(Buffer.from(arrayBuffer));
			} catch (error) {
				reject(error);
			}
		});
	};

	static snapshotCapture = async ({ ctrl_id, cmr_id }: CamIdentifier): Promise<Buffer> => {
		const camara = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
		if (!camara) {
			throw new CustomError(`Cámara ${cmr_id} en nodo ${ctrl_id} no encontrada.`, 404, 'Not Found');
		}

		// Intento 1: Obtener snapshot por HTTP (muy eficiente).
		try {
			const password = decrypt(camara.contraseña);
			const buffer = await Camera.#snapshotViaHttp(camara.ip, camara.usuario, password);
			cameraLogger.info(`Snapshot por HTTP exitoso para cámara ${camara.ip}`);
			return buffer;
		} catch (error) {
			cameraLogger.warn(`Falló el snapshot por HTTP para ${camara.ip}, usando FFmpeg como respaldo.`, error);
		}

		// Intento 2: Fallback a FFmpeg (uso intensivo de recursos).
		const [mainRtsp] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id, cmr_id);

    return new Promise((resolve, reject) => {
      if (mainRtsp !== null) {
        const args = ['-rtsp_transport', 'tcp', '-timeout', `${5 * 1000000}`, '-i', `${mainRtsp}`, '-an', '-t', '10', '-c:v', 'mjpeg', '-f', 'image2pipe', '-'];

        let ffmpegProcessImage: ChildProcessByStdio<null, any, null> | null = null;
        let imageBuffer = Buffer.alloc(0);
        let isInsideImage = false;

        if (!ffmpegProcessImage) {
          ffmpegProcessImage = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
        }
        // Redirigir la salida de ffmpeg al cliente Socket.IO
        ffmpegProcessImage.stdout.on('data', (data: any) => {
          // Verificar marcadores
          const isMarkStart = verifyImageMarkers(data, 'start');
          const isMarkEnd = verifyImageMarkers(data, 'end');
          if (!isInsideImage && isMarkStart) {
            // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
            isInsideImage = true;
          }

          if (isInsideImage) {
            // Concatenar nuevos datos al buffer existente
            imageBuffer = Buffer.concat([imageBuffer, data]);

            if (verifyImageMarkers(imageBuffer, 'complete')) {
              //Imagen completa
              resolve(imageBuffer);
            }
          }

          if (isMarkEnd) {
            // Limpiar el búfer para la siguiente imagen
            imageBuffer = Buffer.alloc(0);
            isInsideImage = false;
          }
        });

        ffmpegProcessImage.on('close', (code) => {
          cameraLogger.info(`snapshotCapture | Proceso ffmpegImage cerrado con código ${code}`);
          if (ffmpegProcessImage) {
            if (ffmpegProcessImage.pid !== undefined) {
              ffmpegProcessImage.kill();
            }
            ffmpegProcessImage = null;
          }

          imageBuffer = Buffer.alloc(0);
          isInsideImage = false;
        });

        ffmpegProcessImage.on('error', (err) => {
          reject(err);
        });
      } else {
        const errGetRtspLink = new CustomError('Ocurrio un error al obtener los links rtsp', 500, 'link-rtsp-error');
        reject(errGetRtspLink);
      }
    });
  };

  static async controlPTZ({ action, velocity, movement, cmr_id, ctrl_id }: ControlPTZDTO & CamIdentifier) {
    const data: ControlPTZDTO = { action, velocity, movement };
    await CameraOnvifManager.controlPTZ(ctrl_id, cmr_id, data);
  }

  static async controlImaging(ctrl_id: number, cmr_id: number, data: ControlImagingDTO) {
    await CameraOnvifManager.controlImaging(ctrl_id, cmr_id, data);
  }

  static async presetPTZ({ cmr_id, ctrl_id, preset }: CamIdentifier & { preset: number }) {
    await CameraOnvifManager.presetPTZ(ctrl_id, cmr_id, preset);
  }

  static getAllCameras = handleErrorWithoutArgument<CamResponse>(async () => {
    const region_nodos = await Init.getRegionNodos();
    if (region_nodos.length > 0) {
      const camerasData = await region_nodos.reduce<Promise<CamResponse>>(async (resultPromise, item) => {
        const result = await resultPromise;
        const { region, nododb_name, nodo, ctrl_id, rgn_id } = item;

        const cams = await MySQL2.executeQuery<CameraInfoRowData[]>({
          sql: `SELECT cmr_id ,ip , descripcion, puertows, c.tc_id ,tipo, marca FROM ${nododb_name}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1 ORDER BY c.ip ASC`,
        });

        if (cams.length > 0) {
          result[rgn_id] = result[rgn_id] || { rgn_id, region, controllers: {} };

          result[rgn_id].controllers[ctrl_id] = result[rgn_id].controllers[ctrl_id] || { ctrl_id, nodo, camaras: [] };

          result[rgn_id].controllers[ctrl_id].camaras = cams.map((cam) => ({ ...cam, nodo, ctrl_id, region, rgn_id: rgn_id }));
        }

        return result;
      }, Promise.resolve({}));
      return camerasData;
    }
    return {};
  }, 'Camera.getAllCameras');

  static getCameraByCtrlId = handleErrorWithArgument<CameraInfo[], Pick<Controlador, 'ctrl_id'>>(async ({ ctrl_id }) => {
    const cams = await MySQL2.executeQuery<CameraInfoRowData[]>({ sql: `SELECT  cmr_id ,ip , descripcion, puertows,tipo, marca FROM ${'nodo' + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1` });

    if (cams.length > 0) {
      return cams;
    }
    return [];
  });
}
