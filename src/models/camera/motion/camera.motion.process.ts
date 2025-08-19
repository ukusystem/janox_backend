// @ts-ignore
// @ts-nocheck

import { ChildProcessByStdio, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Cam } from 'onvif';
import { MySQL2 } from '../../../database/mysql';
import { createImageBase64 } from '../../../utils/stream';
import { getMulticastRtspStreamAndSubStream } from '../../../utils/getCameraRtspLinks';
import dayjs from 'dayjs';
import { CameraMotionMethods, CameraMotionProps, CameraProps } from './camera.motion.types';
import { ControllerMapManager } from '../../maps';
import { cameraLogger } from '../../../services/loggers';
import { CameraMotionManager } from './camera.motion.manager';
import { NodoCameraMapManager } from '../../maps/nodo.camera';
import { CameraReconnect } from '../cam.reconnect';
import { appConfig } from '../../../configs';
import { ensureDirExists, toPosixPath } from '../../../utils/file';
import { getExtesionFile } from '../../../utils/getExtensionFile';
import { generateThumbs } from '../../controllerapp/src/frontTools';

const TIMEOUT_DISCONNECT = 5;
export class CameraMotionProcess implements CameraMotionProps, CameraMotionMethods {
  ip: string;
  usuario: string;
  contraseña: string;
  cmr_id: number;
  ctrl_id: number;

  ffmpegProcess: ChildProcessByStdio<null, null, null> | undefined = undefined;
  isActiveMotion: boolean = false;

  constructor(props: CameraProps) {
    const { cmr_id, ctrl_id, ip, contraseña, usuario } = props;
    this.cmr_id = cmr_id;
    this.ctrl_id = ctrl_id;
    this.ip = ip;

    this.contraseña = contraseña;
    this.usuario = usuario;
  }

  stripNamespaces(topic: any) {
    // example input :-   tns1:MediaControl/tnsavg:ConfigurationUpdateAudioEncCfg
    // Split on '/'
    // For each part, remove any namespace
    // Recombine parts that were split with '/'
    let output = '';
    const parts = topic.split('/');
    for (let index = 0; index < parts.length; index++) {
      const stringNoNamespace = parts[index].split(':').pop(); // split on :, then return the last item in the array
      if (output.length === 0) {
        output += stringNoNamespace;
      } else {
        output += '/' + stringNoNamespace;
      }
    }
    return output;
  }

  processEvent(eventTime: any, eventTopic: any, eventProperty: any, sourceName: any, sourceValue: any, dataName: any, dataValue: any, rtspUrl: string) {
    // let output = "";
    // output += `EVENT: ${eventTime.toJSON()} ${eventTopic}`;
    // if (typeof eventProperty !== "undefined") {
    //   output += ` PROP:${eventProperty}`;
    // }
    // if (typeof sourceName !== "undefined" && typeof sourceValue !== "undefined") {
    //   output += ` SRC:${sourceName}=${sourceValue}`;
    // }
    // if (typeof dataName !== "undefined" && typeof dataValue !== "undefined") {
    //   output += ` DATA:${dataName}=${dataValue}`;
    // }

    if (eventTopic === 'VideoSource/MotionAlarm' || eventTopic === 'RuleEngine/CellMotionDetector/Motion') {
      this.isActiveMotion = dataValue;
    }

    if (this.isActiveMotion) {
      this.snapshotRecord(rtspUrl);
    }
  }

  snapshotRecord(rtspUrl: string) {
    if (this.ffmpegProcess === undefined) {
      try {
        const snapshotPath = path.join('deteccionmovimiento', 'img', `nodo${this.ctrl_id}`, `camara${this.cmr_id}`); // Se usa path.join para crear una ruta segura.
        const baseSnapshotDir = createMotionDetectionFolders(snapshotPath);

        const recordPath = path.join('deteccionmovimiento', 'vid', `nodo${this.ctrl_id}`, `camara${this.cmr_id}`); // Se usa path.join para crear una ruta segura.
        const baseRecordDir = createMotionDetectionFolders(recordPath);

        const recordFile = `record_${Date.now()}.mp4`;
        const ffmpegArgs = getMotionFfmegArgs(rtspUrl, this.ctrl_id, { baseSnapshotDir: baseSnapshotDir.split(path.sep).join(path.posix.sep), baseRecordDir: baseRecordDir.split(path.sep).join(path.posix.sep), recordFile: recordFile });

        const controllerSnapshot = new AbortController();
        // const { signal } = controller;
        if (appConfig.system.start_snapshot_motion) {
          fs.watch(baseSnapshotDir, { signal: controllerSnapshot.signal }, async (eventType, filename) => {
            if (eventType === 'rename' && filename !== null) {
              // search snapshot_%H_%M_%S.jpg and save to db
              const regex = new RegExp(/^snapshot_(\d{2})_(\d{2})_(\d{2})\.jpg$/);
              const isMatch = regex.test(filename);
              if (isMatch) {
                const snapshotFilePath = path.join(baseSnapshotDir, filename);
                fs.readFile(snapshotFilePath, (err, data) => {
                  if (err) {
                    cameraLogger.error(`CameraMotionProcess | Error al leer captura | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id} `, err);
                    return;
                  }
                  if (appConfig.system.start_snapshot_motion) {
                    const imageBase64 = createImageBase64(data);

                    CameraMotionManager.notifyImageMotion(this.ctrl_id, imageBase64);

                    const snapshotSubDirectory = path.relative('./deteccionmovimiento', snapshotFilePath);

                    insertPathToDB(snapshotSubDirectory, this.ctrl_id, this.cmr_id, 0, snapshotFilePath);
                  }
                });
              }
            }
          });
        }

        const newFfmpegProcess = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true });

        this.ffmpegProcess = newFfmpegProcess;

        // this.ffmpegProcess.on('close', async (code, signal) => {
        this.ffmpegProcess.on('close', async (code) => {
          // cameraLogger.debug(`CameraMotionProcess | Proceso ffmpeg cerrado con código ${code} y señal ${signal} | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);

          // abort controllers:
          controllerSnapshot.abort();

          // save record to db : code 0
          const recordFilePath = path.join(baseRecordDir, recordFile);
          if (code === 0) {
            cameraLogger.debug(`CameraMotionProcess| Proceso ffmpeg completado sin errores | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);
            if (appConfig.system.start_record_motion) {
              const recordSubDirectory = path.relative('./deteccionmovimiento', recordFilePath);

              insertPathToDB(recordSubDirectory, this.ctrl_id, this.cmr_id, 1, recordFilePath);
            }
          }
          // else {
          //   cameraLogger.error(`CameraMotionProcess  | Proceso ffmpeg cerrado con código de error: ${code} | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);
          //   // Eliminar video.
          //   fs.unlink(recordFilePath, (err) => {
          //     if (err) {
          //       cameraLogger.error(`CameraMotionProcess | Error al eliminar video: ${recordFilePath} | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`, err);
          //     }
          //   });
          // }

          if (this.ffmpegProcess !== undefined) {
            // this.ffmpegProcess.kill();
            this.ffmpegProcess = undefined;
          }

          if (this.isActiveMotion) {
            // cameraLogger.debug(`CameraMotionProcess | Evento motion continua activo | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);
            const isConnected = await this.isCamConnected();
            if (isConnected) {
              return this.snapshotRecord(rtspUrl);
            } else {
              this.isActiveMotion = false;
              // notificar deconexión
              NodoCameraMapManager.update(this.ctrl_id, this.cmr_id, { conectado: 0 });
              const camera = NodoCameraMapManager.getCamera(this.ctrl_id, this.cmr_id);
              if (camera !== undefined) {
                cameraLogger.info(`CameraMotionProcess | Notify Camera Disconnect | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);
                // notifyCamDisconnect(this.ctrl_id, { ...camera });
                const newCamConnect = new CameraReconnect(this.ctrl_id, this.cmr_id, 'Motion');
                newCamConnect.start();
              }
            }
          }
        });
      } catch (error) {
        cameraLogger.error(`CameraMotionProcess | Error en CameraMotion.snapshotRecord | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`, error);
      }
    }
  }

  receivedEvent(camMessage: any, xml: any, rtspUrl: string) {
    // Extract Event Details
    // Events have a Topic
    // Events have (optionally) a Source, a Key and Data fields
    // The Source,Key and Data fields can be single items or an array of items
    // The Source,Key and Data fields can be of type SimpleItem or a Complex Item

    //    - Topic
    //    - Message/Message/$
    //    - Message/Message/Source...
    //    - Message/Message/Key...
    //    - Message/Message/Data/SimpleItem/[index]/$/name   (array of items)
    // OR - Message/Message/Data/SimpleItem/$/name   (single item)
    //    - Message/Message/Data/SimpleItem/[index]/$/value   (array of items)
    // OR - Message/Message/Data/SimpleItem/$/value   (single item)

    let eventTopic = camMessage.topic._;
    eventTopic = this.stripNamespaces(eventTopic);

    const eventTime = camMessage.message.message.$.UtcTime;

    const eventProperty = camMessage.message.message.$.PropertyOperation;
    // Supposed to be Initialized, Deleted or Changed but missing/undefined on the Avigilon 4 channel encoder

    // Only handle simpleItem
    // Only handle one 'source' item
    // Ignore the 'key' item  (nothing I own produces it)
    // Handle all the 'Data' items

    // SOURCE (Name:Value)
    let sourceName = null;
    let sourceValue = null;
    if (camMessage.message.message.source && camMessage.message.message.source.simpleItem) {
      if (Array.isArray(camMessage.message.message.source.simpleItem)) {
        sourceName = camMessage.message.message.source.simpleItem[0].$.Name;
        sourceValue = camMessage.message.message.source.simpleItem[0].$.Value;
        // console.log("WARNING: Only processing first Event Source item");
      } else {
        sourceName = camMessage.message.message.source.simpleItem.$.Name;
        sourceValue = camMessage.message.message.source.simpleItem.$.Value;
      }
    } else {
      sourceName = null;
      sourceValue = null;
      // console.log("WARNING: Source does not contain a simpleItem");
    }

    //KEY
    if (camMessage.message.message.key) {
      // console.log("NOTE: Event has a Key");
    }

    // DATA (Name:Value)
    if (camMessage.message.message.data && camMessage.message.message.data.simpleItem) {
      if (Array.isArray(camMessage.message.message.data.simpleItem)) {
        for (let x = 0; x < camMessage.message.message.data.simpleItem.length; x++) {
          const dataName = camMessage.message.message.data.simpleItem[x].$.Name;
          const dataValue = camMessage.message.message.data.simpleItem[x].$.Value;
          this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
        }
      } else {
        const dataName = camMessage.message.message.data.simpleItem.$.Name;
        const dataValue = camMessage.message.message.data.simpleItem.$.Value;
        this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
      }
    } else if (camMessage.message.message.data && camMessage.message.message.data.elementItem) {
      // console.log("WARNING: Data contain an elementItem");
      const dataName = 'elementItem';
      const dataValue = JSON.stringify(camMessage.message.message.data.elementItem);
      this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
    } else {
      // console.log("WARNING: Data does not contain a simpleItem or elementItem");
      const dataName = null;
      const dataValue = null;
      this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
    }
  }

  getCamOnvifInstance(): Promise<Cam> {
    const camOvifProps = {
      hostname: this.ip,
      username: this.usuario,
      password: this.contraseña,
      timeout: 10000,
      preserveAddress: true,
      autoconnect: true,
    };

    return new Promise<Cam>((resolve, reject) => {
      new Cam(camOvifProps, function (err: any) {
        if (err) {
          const errConection = new Error(`Deteccion de Movimiento | No se pudo establecer conexion a la camara ${camOvifProps.hostname}`);
          return reject(errConection);
        }
        return resolve(this);
      });
    });
  }

  private isCamConnected(): Promise<boolean> {
    const camOvifProps = {
      hostname: this.ip,
      username: this.usuario,
      password: this.contraseña,
      timeout: 5000,
      preserveAddress: true,
      autoconnect: true,
    };

    return new Promise<boolean>((resolve, _reject) => {
      new Cam(camOvifProps, function (err: any) {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  getDeviceInformation(cam: Cam): Promise<any> {
    const camHostname = this.ip;

    return new Promise<any>((resolve, reject) => {
      cam.getDeviceInformation((err: any, info: any, _xml: any) => {
        if (err) {
          const errDiviceInformation = new Error(`Deteccion de Movimiento | No se pudo obtener informacion del dispositivo ${camHostname}`);
          return reject(errDiviceInformation);
        } else {
          return resolve(info);
        }
      });
    });
  }

  getSystemDateAndTime(cam: Cam): Promise<any> {
    const camHostname = this.ip;
    return new Promise<any>((resolve, reject) => {
      cam.getSystemDateAndTime((err: any, date: any, _xml: any) => {
        if (err) {
          const errSysDataTime = new Error(`Deteccion de Movimiento | No se pudo obtener el 'system datetime' del dispositivo ${camHostname}`);
          return reject(errSysDataTime);
        } else {
          return resolve(date);
        }
      });
    });
  }

  getStreamUri(cam: Cam): Promise<any> {
    const camHostname = this.ip;
    return new Promise<any>((resolve, reject) => {
      cam.getStreamUri({ protocol: 'RTSP' }, function (err: any, stream: any) {
        if (err) {
          const errStremaUri = new Error(`Deteccion de Movimiento | No se pudo obtener el 'stream uri' del dispositivo ${camHostname}`);
          return reject(errStremaUri);
        } else {
          return resolve(stream.uri);
        }
      });
    });
  }

  getCapabilities(cam: Cam): Promise<boolean> {
    const camHostname = this.ip;
    return new Promise<boolean>((resolve, reject) => {
      cam.getCapabilities(function (err: any, data: any, _xml: any) {
        try {
          if (err) {
            const errCapabilities = new Error(`Deteccion de Movimiento | No se pudo obtener las 'capabilities' del dispositivo ${camHostname}`);
            reject(errCapabilities);
          }
          if (data.events) {
            return resolve(true);
          } else {
            return resolve(false);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          const errEvents = new Error(`Deteccion de Movimiento | No de pudo obtener eventos ${camHostname}`);
          reject(errEvents);
        }
      });
    });
  }

  getEventProperties(cam: Cam, hasEvents: boolean) {
    const camHostname = this.ip;
    let hasTopics: boolean = false;
    return new Promise<boolean>((resolve, reject) => {
      if (hasEvents) {
        cam.getEventProperties(function (err: any, data: any, _xml: any) {
          if (err) {
            const errEventProperties = new Error(`Deteccion de Movimiento | No se pudo obtener las 'event properties' del dispositivo ${camHostname}`);
            return reject(errEventProperties);
          } else {
            // Display the available Topics
            const parseNode = function (node: any, topicPath: any) {
              // loop over all the child nodes in this node
              for (const child in node) {
                if (child === '$') {
                  continue;
                } else if (child === 'messageDescription') {
                  // we have found the details that go with an event
                  // examine the messageDescription
                  // let IsProperty = false;
                  // let source = "";
                  // let data = "";
                  // if (node[child].$ && node[child].$.IsProperty) {
                  //   IsProperty = node[child].$.IsProperty;
                  // }
                  // if (node[child].source) {
                  //   // source = JSON.stringify(node[child].source);
                  // }
                  // if (node[child].data) {
                  //   // data = JSON.stringify(node[child].data);
                  // }
                  // console.log("Found Event - " + topicPath.toUpperCase());
                  //console.log('  IsProperty=' + IsProperty);
                  // if (source.length > 0) {
                  //   // console.log("  Source=" + source);
                  // }
                  // if (data.length > 0) {
                  //   // console.log("  Data=" + data);
                  // }

                  hasTopics = true;
                  return;
                } else {
                  // decend into the child node, looking for the messageDescription
                  parseNode(node[child], topicPath + '/' + child);
                }
              }
            };
            parseNode(data.topicSet, '');
            resolve(hasTopics);
          }
          // console.log("");
          // console.log("");
        });
      } else {
        const errHasEvents = new Error(`Deteccion de Movimiento | No se encontraron 'events' en el dispositivo ${camHostname}`);
        reject(errHasEvents);
      }
    });
  }

  async execute() {
    try {
      const camOnvif = await this.getCamOnvifInstance();
      cameraLogger.info(`CameraMotionProcess | execute | Conexion establecida con la camara ${this.ip}`);

      // Proceso 1
      const info = await this.getDeviceInformation(camOnvif);
      cameraLogger.info(`CameraMotionProcess | execute | Manufacturer  ${info.manufacturer}`);
      cameraLogger.info(`CameraMotionProcess | execute | Model         ${info.model}`);
      cameraLogger.info(`CameraMotionProcess | execute | Firmware      ${info.firmwareVersion}`);
      cameraLogger.info(`CameraMotionProcess | execute | Serial Number ${info.serialNumber}`);
      // Proceso 2
      const date = await this.getSystemDateAndTime(camOnvif);
      cameraLogger.info(`CameraMotionProcess | execute | Device Time   ${date}`);
      // Get RTSP:
      const onvifRtspUrl = await this.getStreamUri(camOnvif);
      // const rstpUrl = addCredentialToRtsp(onvifRtspUrl, this.usuario, this.contraseña);
      const multRtsp = await getMulticastRtspStreamAndSubStream(onvifRtspUrl, this.usuario, this.contraseña, info.manufacturer);
      cameraLogger.info(`CameraMotionProcess | execute | Rtsp URL : ${JSON.stringify(multRtsp)}`);
      //Proceso 3
      const hasEvents = await this.getCapabilities(camOnvif);
      // Proceso 4
      const hasTopics = await this.getEventProperties(camOnvif, hasEvents);

      cameraLogger.info(`CameraMotionProcess | execute | hasEvents && hasTopics ${hasEvents} ${hasTopics}`);
      if (hasEvents && hasTopics) {
        // register for 'event' events. This causes the library to ask the camera for Pull Events
        camOnvif.on('event', (camMessage: any, xml: any) => {
          this.receivedEvent(camMessage, xml, multRtsp[0]);
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        cameraLogger.error(`CameraMotionProcess | Execute Error | ctrl_id : ${this.ctrl_id} | cmr_id ${this.cmr_id}`, error.message);
      } else {
        cameraLogger.error(`CameraMotionProcess | Execute Error | ctrl_id : ${this.ctrl_id} | cmr_id ${this.cmr_id}`, error);
      }
      // throw error
    }
  }
}

const getMotionFfmegArgs = (rtspUrl: string, ctrl_id: number, configs: { baseRecordDir: string; recordFile: string; baseSnapshotDir: string }): string[] => {
  const ctrlConfig = ControllerMapManager.getControllerAndResolution(ctrl_id);
  if (ctrlConfig === undefined) {
    throw new Error(`Error getMotionFfmegArgs | Controlador ${ctrl_id} no encontrado getControllerAndResolution`);
  }

  const isMotionDetection = appConfig.system.start_record_motion || appConfig.system.start_snapshot_motion;
  if (!isMotionDetection) {
    throw new Error(`Error getMotionFfmegArgs | Motion detection disabled.`);
  }

  const {
    controller,
    resolution: { motion_snapshot, motion_record },
  } = ctrlConfig;

  const result: string[] = ['-rtsp_transport', 'tcp', '-i', `${rtspUrl}`];

  if (appConfig.system.start_record_motion) {
    const recordPath = path.join(configs.baseRecordDir, configs.recordFile);
    result.push(...['-t', `${controller.motionrecordseconds}`, '-c:v', 'libx264', '-preset', 'ultrafast', '-r', `${controller.motionrecordfps}`, '-an', '-vf', `scale=${motion_record.ancho}:${motion_record.altura}`, `${recordPath}`]);
  }

  if (appConfig.system.start_snapshot_motion) {
    result.push(...['-t', `${controller.motionsnapshotseconds}`, '-an', '-c:v', 'mjpeg', '-vf', `scale=${motion_snapshot.ancho}:${motion_snapshot.altura},select='gte(t\\,0)',fps=1/${controller.motionsnapshotinterval}`, '-strftime', '1', `${configs.baseSnapshotDir}/snapshot_%H_%M_%S.jpg`]);
  }

  return result;
};

function createFolderIfNotExists(dir: fs.PathLike) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');

  return { year, month, day, hour };
}

export function createMotionDetectionFolders(motionDetectionPath: string) {
  const { year, month, day, hour } = getCurrentDateTime();

  const folderPath = path.join(motionDetectionPath, `${year}-${month}-${day}`, hour);
  createFolderIfNotExists(folderPath);

  return folderPath;
}

export const insertPathToDB = (relativePath: string, ctrl_id: number, cmr_id: number, tipo: 0 | 1, filePath?: string) => {
  (async () => {
    try {
      const rutaRelativa = toPosixPath(relativePath);
      const fecha = dayjs().format('YYYY-MM-DD HH:mm:ss');

      let thumbnailPathResult: string | null = null;
      if (filePath) {
        try {
          const filePathResolve = path.resolve(filePath);
          const thumbnailPath = path.resolve(getThumbPath(filePath));
          const extensionFile = getExtesionFile(filePath);

          ensureDirExists(path.dirname(thumbnailPath));
          const { result, thumbBase64 } = await generateThumbs({ filepath: filePathResolve, type: extensionFile === 'jpg' ? 'image/jpg' : 'video/mp4' });

          if (result) {
            const imageBuffer = Buffer.from(thumbBase64, 'base64');
            fs.writeFileSync(thumbnailPath, imageBuffer);
            thumbnailPathResult = toPosixPath(path.relative('./deteccionmovimiento', thumbnailPath));
          }
        } catch (error) {
          cameraLogger.debug(`Error al generar y guardar el thumbnail ctrl_id: ${ctrl_id} , cmr_id: ${cmr_id} , tipo: ${tipo} `, error);
        }
      }

      await MySQL2.executeQuery({ sql: `INSERT INTO ${'nodo' + ctrl_id}.registroarchivocamara (cmr_id , tipo, ruta, thumbnail, fecha) VALUES ( ? ,? , ?, ?, ?)`, values: [cmr_id, tipo, rutaRelativa, thumbnailPathResult, fecha] });
    } catch (error) {
      cameraLogger.error(`CameraMotionProcess | insertPathToDB | Error al insertar path a la db:\n`, error);
    }
  })();
};

function getThumbPath(originalPath: string): string {
  return originalPath.replace(/\.\w+$/, '_thumb.jpg');
}
