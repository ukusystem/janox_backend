import path from 'path';
import { createMotionDetectionFolders, insertPathToDB } from '../../../models/camera';
import { getRstpLinksByCtrlIdAndCmrId } from '../../../utils/getCameraRtspLinks';
import { CamRecordMap, ControllerRecordMap, ControllerRecordObserverMap, RecordObserverMap, RecordStreamObserver, SocketRecordStream } from './record.stream.types';
import { spawn } from 'child_process';
import fs from 'fs';
import { vmsLogger } from '../../../services/loggers';

export class RecStreamSocketObserver implements RecordStreamObserver {
  #socket: SocketRecordStream;

  constructor(socket: SocketRecordStream) {
    this.#socket = socket;
  }
  updateRecordState(data: boolean): void {
    this.#socket.nsp.emit('stream_is_recording', data);
  }
}

export class RecordStreamManager {
  static #records: ControllerRecordMap = new Map();
  static #observers: ControllerRecordObserverMap = new Map();

  static registerObserver(ctrl_id: number, cmr_id: number, new_observer: RecordStreamObserver): void {
    const currCtrlObservers = RecordStreamManager.#observers.get(ctrl_id);
    if (currCtrlObservers === undefined) {
      const newRecObMap: RecordObserverMap = new Map();
      newRecObMap.set(cmr_id, new_observer);
      RecordStreamManager.#observers.set(ctrl_id, newRecObMap);
    } else {
      if (!currCtrlObservers.has(cmr_id)) {
        currCtrlObservers.set(cmr_id, new_observer);
      }
    }
  }

  static unregisterObserver(ctrl_id: number, cmr_id: number): void {
    const currCtrlObservers = RecordStreamManager.#observers.get(ctrl_id);
    if (currCtrlObservers !== undefined) {
      currCtrlObservers.delete(cmr_id);
    }
  }

  static notifyRecordState(ctrl_id: number, cmr_id: number, data: boolean): void {
    const currCtrlObservers = RecordStreamManager.#observers.get(ctrl_id);
    if (currCtrlObservers !== undefined) {
      const curObserver = currCtrlObservers.get(cmr_id);
      if (curObserver !== undefined) {
        curObserver.updateRecordState(data);
      }
    }
  }

  static async #getSpawnArgs(ctrl_id: number, cmr_id: number, time_seconds: number): Promise<string[]> {
    const [mainRtsp] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id, cmr_id);
    return ['-rtsp_transport', 'tcp', '-timeout', `${5 * 1000000}`, '-i', `${mainRtsp}`, '-c:v', 'libx264', '-t', `${time_seconds * 60}`, '-preset', 'ultrafast', '-tune', 'zerolatency', '-f', 'mpegts', 'pipe:1'];
  }

  static #getRecordPath(ctrl_id: number, cmr_id: number): string {
    const pathFolderVidRecord = createMotionDetectionFolders(`./deteccionmovimiento/vid/nodo${ctrl_id}/camara${cmr_id}`);
    const videoRecordPath = path.join(pathFolderVidRecord, `grabacion_${Date.now()}.mp4`);
    return videoRecordPath;
  }

  static async startRecord(ctrl_id: number, cmr_id: number, time_seconds: number) {
    const currController = RecordStreamManager.#records.get(ctrl_id);

    const args = await RecordStreamManager.#getSpawnArgs(ctrl_id, cmr_id, time_seconds);
    const recordPath = RecordStreamManager.#getRecordPath(ctrl_id, cmr_id);

    if (currController === undefined) {
      const newCamRecordMap: CamRecordMap = new Map();

      const newFfmpegProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
      const videoRecordStream = fs.createWriteStream(recordPath);

      vmsLogger.info(`Stream Record Socket | start_recording | ctrl_id = ${ctrl_id} | cmr_id = ${cmr_id}`);

      newCamRecordMap.set(cmr_id, [newFfmpegProcess, videoRecordStream]);

      newFfmpegProcess.stdout.on('data', (chunk: any) => {
        RecordStreamManager.notifyRecordState(ctrl_id, cmr_id, true);
        videoRecordStream.write(chunk);
      });

      newFfmpegProcess.on('close', (code, signal) => {
        vmsLogger.info(`Stream Record Socket | Proceso de FFMPEG finalizado con código de salida ${code} y señal ${signal} | ctrl_id = ${ctrl_id} | cmr_id = ${cmr_id}`);
        if (code === null || code === 0) {
          videoRecordStream.close();
          insertPathToDB(recordPath, ctrl_id, cmr_id, 1);
        }
        newCamRecordMap.delete(cmr_id);
        RecordStreamManager.notifyRecordState(ctrl_id, cmr_id, false);
      });

      RecordStreamManager.#records.set(ctrl_id, newCamRecordMap);
    } else {
      if (!currController.has(cmr_id)) {
        const newFfmpegProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
        const videoRecordStream = fs.createWriteStream(recordPath);

        vmsLogger.info(`Stream Record Socket | start_recording | ctrl_id = ${ctrl_id} | cmr_id = ${cmr_id}`);

        newFfmpegProcess.stdout.on('data', (chunk: any) => {
          RecordStreamManager.notifyRecordState(ctrl_id, cmr_id, true);
          videoRecordStream.write(chunk);
        });

        newFfmpegProcess.on('close', (code, signal) => {
          vmsLogger.info(`Stream Record Socket | Proceso de FFMPEG finalizado con código de salida ${code} y señal ${signal} | ctrl_id = ${ctrl_id} | cmr_id = ${cmr_id}`);
          if (code === null || code === 0) {
            videoRecordStream.close();
            insertPathToDB(recordPath, ctrl_id, cmr_id, 1);
          }
          currController.delete(cmr_id);
          RecordStreamManager.notifyRecordState(ctrl_id, cmr_id, false);
          RecordStreamManager.unregisterObserver(ctrl_id, cmr_id);
        });

        currController.set(cmr_id, [newFfmpegProcess, videoRecordStream]);
      }
    }
  }

  static async stopRecord(ctrl_id: number, cmr_id: number) {
    const currController = RecordStreamManager.#records.get(ctrl_id);
    if (currController !== undefined) {
      const curRecord = currController.get(cmr_id);
      if (curRecord !== undefined) {
        vmsLogger.info(`Stream Record Socket | stop_recording | ctrl_id = ${ctrl_id} | cmr_id = ${cmr_id}`);
        if (curRecord[0] && curRecord[0].pid !== undefined) {
          curRecord[0].kill();
        }
      }
    }
  }
}
