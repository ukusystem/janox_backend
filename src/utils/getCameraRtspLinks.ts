// @ts-ignore
// @ts-nocheck

import { Cam } from 'onvif';
import { MySQL2 } from '../database/mysql';
import { Camara } from '../types/db';
import { decrypt } from './decrypt';
import { CustomError } from './CustomError';
import { RowDataPacket } from 'mysql2';

interface CamaraData extends Camara, RowDataPacket {}

export function addCredentialToRtsp(rtspLink: string, username: string, password: string) {
  // Verificar que rtspLink comience con "rtsp://"
  if (!rtspLink.startsWith('rtsp://')) {
    throw new Error('El enlace RTSP debe comenzar con "rtsp://"');
  }

  // Crear el enlace RTSP con las credenciales
  const rtspLinkWithCredentials = `${rtspLink.replace(/^rtsp:\/\//, 'rtsp://' + username + ':' + password + '@')}`;

  return rtspLinkWithCredentials;
}

export const getRstpLinksByCtrlIdAndCmrId = async (ctrl_id: number, cmr_id: number): Promise<string[]> => {
  // const camara = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);

  const camaras = await MySQL2.executeQuery<CamaraData[]>({ sql: `SELECT * FROM ${'nodo' + ctrl_id}.camara WHERE cmr_id = ? `, values: [cmr_id] });

  const camara = camaras[0];

  return new Promise((resolve, reject) => {
    if (camara === undefined) {
      const errorCamData = new Error(`Camara cmr_id: ${cmr_id} no se encuentra en NodoCameraMapManager.`);
      return reject(errorCamData);
    }
    const { usuario, contraseña, ip } = camara;

    const contraseñaDecrypt = decrypt(contraseña);

    new Cam(
      {
        hostname: ip,
        username: usuario,
        password: contraseñaDecrypt,
        timeout: 5000,
      },
      async function (err: any) {
        if (err) {
          const errCamConnect = new CustomError(`Error al intentar establecer conexión con la cámara ${ip}`, 500, 'Onvif Camera Connection');
          return reject(errCamConnect);
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const cam_obj = this;

        function getStreamUriPromise() {
          return new Promise<any>((resolve, reject) => {
            cam_obj.getStreamUri({ protocol: 'RTSP' }, function (err: any, stream: any) {
              if (err) {
                const errGetStreamUri = new CustomError('Se produjo un error al intentar obtener el StreamUri RTSP ', 500, 'Onvif Stream URI');
                return reject(errGetStreamUri);
              } else {
                resolve(stream.uri);
              }
            });
          });
        }

        function getDeviceInformationPromise() {
          return new Promise<any>((resolve, reject) => {
            cam_obj.getDeviceInformation((err: any, info: any, _xml: any) => {
              if (err) {
                const errGetDiveceInformation = new CustomError('Se produjo un error al intentar informacion del dispositivo ', 500, 'Onvif Divice Information');
                return reject(errGetDiveceInformation);
              } else {
                resolve(info);
              }
            });
          });
        }

        try {
          const info = await getDeviceInformationPromise();
          const manufacturer = info.manufacturer;
          if (manufacturer !== 'Dahua' && manufacturer !== 'HIKVISION') {
            const errorManufacturer = new Error('Marca de camara no soportada');
            throw errorManufacturer;
          }

          // Get RTSP:
          const onvifRtspUrl = await getStreamUriPromise();
          if (!onvifRtspUrl) {
            const errorRtspUrl = new Error('Error al obtener link rtsp');
            throw errorRtspUrl;
          }
          const mulRstp = await getMulticastRtspStreamAndSubStream(onvifRtspUrl, usuario, contraseñaDecrypt, manufacturer);

          resolve(mulRstp);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};

export function getMulticastRtspStreamAndSubStream(rtspUriOnvif: string, username: string, password: string, manufacturer: 'HIKVISION' | 'Dahua') {
  return new Promise<string[]>((resolve, reject) => {
    const result: string[] = [];

    if (!rtspUriOnvif.startsWith('rtsp://')) {
      const errRtsp = new Error('El enlace RTSP debe comenzar con "rtsp://"');
      return reject(errRtsp);
    }

    if (manufacturer === 'HIKVISION') {
      // Eliminar "?transportmode=unicast&profile=Profile_1" de rtsp://<ip>/Streaming/Channels/101?transportmode=unicast&profile=Profile_1
      const rtspMain = rtspUriOnvif.split('?')[0];

      // Cambiar 101 --> 102
      const rtspSub = rtspMain.replace(/1(?=[^1]*$)/, '2');

      // Agregar credenciales al main rtsp
      const rtspMainWihtCredentials = addCredentialToRtsp(rtspMain, username, password);
      result.push(rtspMainWihtCredentials);

      // Agregar credenciales al sub rstp
      const rtspSubWithCredentials = addCredentialToRtsp(rtspSub, username, password);
      result.push(rtspSubWithCredentials);

      return resolve(result);
    }

    if (manufacturer === 'Dahua') {
      // Eliminar "&unicast=true&proto=Onvif" de "rtsp://<ip>/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif"
      const rtspMain = rtspUriOnvif.replace(/&unicast=true&proto=Onvif/, '');

      //Cambiar 0 --> 1
      const rtspSub = rtspMain.replace(/0(?=[^0]*$)/, '1');

      // Agregar credenciales al main rtsp
      const rtspMainWihtCredentials = addCredentialToRtsp(rtspMain, username, password);
      result.push(rtspMainWihtCredentials);

      // Agregar credenciales al sub rstp
      const rtspSubWithCredentials = addCredentialToRtsp(rtspSub, username, password);
      result.push(rtspSubWithCredentials);

      return resolve(result);
    }

    const errorManufacturer = new Error('Solo se soparta a los siguientes fabricantes: "HIKVISION" | "Dahua" ');
    return reject(errorManufacturer);
  });
}
