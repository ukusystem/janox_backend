import { Socket } from 'socket.io';
import { CamStreamDirection, CamStreamObserver, CamStreamQuality, CamStreamState, ICamStreamFfmpegProcess, ICamStreamProccesObserver } from './camera.stream.types';
import { createImageBase64, getFfmpegArgs, verifyImageMarkers } from '../../../utils/stream';
import { spawn } from 'child_process';
import { CustomError } from '../../../utils/CustomError';
import { vmsLogger } from '../../../services/loggers';
import { NodoCameraMapManager } from '../../../models/maps/nodo.camera';

export class CamStreamSocketObserver implements CamStreamObserver {
  #socket: Socket;

  constructor(socket: Socket) {
    this.#socket = socket;
  }

  updateState(state: boolean, typeState: keyof CamStreamState): void {
    this.#socket.nsp.emit('stream_state', { state, typeState });
  }
  updateFlux(frameBase64: string): void {
    this.#socket.nsp.emit('stream_flux', frameBase64);
  }
  updateError(message: string): void {
    this.#socket.nsp.emit('stream_error', message);
  }
}

export class CamStreamSocketManager {
  static process: ICamStreamFfmpegProcess = {};
  static observer: ICamStreamProccesObserver = {};

  static registerObserver(direction: CamStreamDirection, observer: CamStreamObserver): void {
    const { ctrl_id, cmr_id, q } = direction;

    if (!CamStreamSocketManager.observer[ctrl_id]) {
      CamStreamSocketManager.observer[ctrl_id] = {};
    }

    if (!CamStreamSocketManager.observer[ctrl_id][cmr_id]) {
      CamStreamSocketManager.observer[ctrl_id][cmr_id] = {};
    }

    if (!CamStreamSocketManager.observer[ctrl_id][cmr_id][q]) {
      CamStreamSocketManager.observer[ctrl_id][cmr_id][q] = { observer, canDelete: true };
    }
  }

  static unregisterObserver(direction: CamStreamDirection): void {
    const { ctrl_id, cmr_id, q } = direction;

    const observerConfig = CamStreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      if (observerConfig.canDelete) {
        delete CamStreamSocketManager.observer[ctrl_id][cmr_id][q];
      }
    }
  }

  static notifyState(direction: CamStreamDirection, state: boolean, typeState: keyof CamStreamState): void {
    const observerConfig = CamStreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.observer.updateState(state, typeState);
    }
  }
  static notifyFlux(direction: CamStreamDirection, frameBase64: string): void {
    const observerConfig = CamStreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.observer.updateFlux(frameBase64);
    }
  }

  static notifyError(direction: CamStreamDirection, message: string): void {
    const observerConfig = CamStreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.observer.updateError(message);
    }
  }

  static notifyChangeConfig(ctrl_id: number, q: CamStreamQuality): void {
    // notificar a todas las camaras que esten emitiendo con la calidad 'q'
    if (CamStreamSocketManager.process[ctrl_id]) {
      for (const cmr_id in CamStreamSocketManager.process[ctrl_id]) {
        const qualities = CamStreamSocketManager.process[ctrl_id][cmr_id];
        if (qualities[q]) {
          // cambiar estado -> configurando
          CamStreamSocketManager.notifyState({ ctrl_id, cmr_id: Number(cmr_id), q }, false, 'isSuccess');
          CamStreamSocketManager.notifyState({ ctrl_id, cmr_id: Number(cmr_id), q }, true, 'isConfiguring');
          // cambiar estado observador -> para que no se elimine la instancia

          CamStreamSocketManager.#setObserverState({ ctrl_id, cmr_id: Number(cmr_id), q }, false);
          // eliminar instancia
          CamStreamSocketManager.killProcess({ ctrl_id, cmr_id: Number(cmr_id), q });

          setTimeout(() => {
            // crear nuevo proceso
            vmsLogger.info(`Camera Stream Manager | Crear nuevo proceso`, { ctrl_id, cmr_id, q });

            CamStreamSocketManager.createProccess({ ctrl_id, cmr_id: Number(cmr_id), q });
            // cambiar estado observador
            CamStreamSocketManager.#setObserverState({ ctrl_id, cmr_id: Number(cmr_id), q }, true);
            // cambiar estado
            // CamStreamSocketManager.notifyState({ctrl_id,ip,q}, false ,"isConfiguring");
            // CamStreamSocketManager.notifyState({ctrl_id,ip,q}, false ,"isSuccess");
          }, 200);
        }
      }
    }
  }

  static #setObserverState(direction: CamStreamDirection, newState: boolean) {
    const observerConfig = CamStreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.canDelete = newState;
    }
  }

  static #getObserver(direction: CamStreamDirection) {
    const { ctrl_id, cmr_id, q } = direction;
    if (CamStreamSocketManager.observer[ctrl_id]) {
      if (CamStreamSocketManager.observer[ctrl_id][cmr_id]) {
        if (CamStreamSocketManager.observer[ctrl_id][cmr_id][q]) {
          return CamStreamSocketManager.observer[ctrl_id][cmr_id][q];
        }
      }
    }

    return undefined;
  }

  static async createProccess(direction: CamStreamDirection) {
    const { ctrl_id, cmr_id, q } = direction;

    setTimeout(async () => {
      // esperar un tiempo -> correcto cierre de procesos

      if (!CamStreamSocketManager.process[ctrl_id]) {
        CamStreamSocketManager.process[ctrl_id] = {};
      }

      if (!CamStreamSocketManager.process[ctrl_id][cmr_id]) {
        CamStreamSocketManager.process[ctrl_id][cmr_id] = {};
      }

      if (!CamStreamSocketManager.process[ctrl_id][cmr_id][q]) {
        try {
          CamStreamSocketManager.notifyState(direction, false, 'isConfiguring');
          CamStreamSocketManager.notifyState(direction, true, 'isLoading');
          CamStreamSocketManager.notifyState(direction, false, 'isSuccess');
          CamStreamSocketManager.notifyState(direction, false, 'isError');

          const cameraFound = NodoCameraMapManager.getCamera(ctrl_id, cmr_id);
          if (cameraFound === undefined) {
            throw new Error('Camara no encontrada');
          }

          const newFfmpegArg = await getFfmpegArgs(ctrl_id, cameraFound.cmr_id, q);

          const newFfmpegProcess = spawn('ffmpeg', newFfmpegArg, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });

          CamStreamSocketManager.process[ctrl_id][cmr_id][q] = {
            ffmpegProcess: newFfmpegProcess,
            isChunkInFrame: false,
            bufferFrame: Buffer.alloc(0),
          };
        } catch (error) {
          // console.error(error)
          if (error instanceof CustomError || error instanceof Error) {
            CamStreamSocketManager.notifyState(direction, false, 'isLoading');
            CamStreamSocketManager.notifyState(direction, true, 'isError');
            CamStreamSocketManager.notifyError(direction, error.message);

            return;
          }

          CamStreamSocketManager.notifyState(direction, false, 'isLoading');
          CamStreamSocketManager.notifyState(direction, true, 'isError');
          CamStreamSocketManager.notifyError(direction, 'Se ha producido un error inesperado al intentar obtener el stream.');

          return;
        }
      }

      // Redirigir la salida de ffmpeg al cliente Socket.IO
      CamStreamSocketManager.process[ctrl_id][cmr_id][q].ffmpegProcess.stdout.on('data', (data: Buffer) => {
        if (CamStreamSocketManager.process[ctrl_id][cmr_id][q]) {
          CamStreamSocketManager.notifyState(direction, false, 'isConfiguring');
          CamStreamSocketManager.notifyState(direction, false, 'isLoading');
          CamStreamSocketManager.notifyState(direction, true, 'isSuccess');

          // Verificar marcadores
          const isMarkStart = verifyImageMarkers(data, 'start');
          const isMarkEnd = verifyImageMarkers(data, 'end');

          if (!CamStreamSocketManager.process[ctrl_id][cmr_id][q].isChunkInFrame && isMarkStart) {
            // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
            CamStreamSocketManager.process[ctrl_id][cmr_id][q].isChunkInFrame = true;
          }

          if (CamStreamSocketManager.process[ctrl_id][cmr_id][q].isChunkInFrame) {
            // Concatenar nuevos datos al buffer existente

            CamStreamSocketManager.process[ctrl_id][cmr_id][q].bufferFrame = Buffer.concat([CamStreamSocketManager.process[ctrl_id][cmr_id][q].bufferFrame, data]);

            if (verifyImageMarkers(CamStreamSocketManager.process[ctrl_id][cmr_id][q].bufferFrame, 'complete')) {
              //Imagen completa
              const imageBase64 = createImageBase64(CamStreamSocketManager.process[ctrl_id][cmr_id][q].bufferFrame);
              CamStreamSocketManager.notifyFlux(direction, imageBase64); // Emitir datos al cliente a través de Socket.IO
            }
          }

          if (isMarkEnd) {
            // Limpiar el búfer para la siguiente imagen
            CamStreamSocketManager.process[ctrl_id][cmr_id][q].bufferFrame = Buffer.alloc(0);
            CamStreamSocketManager.process[ctrl_id][cmr_id][q].isChunkInFrame = false;
          }
        }
      });

      CamStreamSocketManager.process[ctrl_id][cmr_id][q].ffmpegProcess.on('close', (code, signal) => {
        vmsLogger.info(`Camera Stream Manager | Proceso ffmpeg cerrado con código ${code} y señal ${signal}`, direction);

        const currentProcess = CamStreamSocketManager.process[ctrl_id][cmr_id][q];
        if (currentProcess) {
          // delete observer
          // CamStreamSocketManager.unregisterObserver({ctrl_id,ip,q})
          if (currentProcess.ffmpegProcess && currentProcess.ffmpegProcess.pid !== undefined) {
            try {
              currentProcess.ffmpegProcess.kill();
            } catch (error) {
              vmsLogger.error(`Camera Stream Manager | createProccess | Error kill process | ${JSON.stringify(direction)} `, error);
            }
          }

          delete CamStreamSocketManager.process[ctrl_id][cmr_id][q];
          if (code !== null) {
            CamStreamSocketManager.notifyState(direction, false, 'isSuccess');
            CamStreamSocketManager.notifyState(direction, false, 'isLoading');
            CamStreamSocketManager.notifyState(direction, true, 'isError');
            CamStreamSocketManager.notifyError(direction, ` Camara ${cmr_id} | Error al consumir flujo.`);
          }
        }
      });
    }, 100);
  }

  static killProcess(direction: CamStreamDirection) {
    const { ctrl_id, cmr_id, q } = direction;
    if (CamStreamSocketManager.process[ctrl_id]) {
      if (CamStreamSocketManager.process[ctrl_id][cmr_id]) {
        if (CamStreamSocketManager.process[ctrl_id][cmr_id][q]) {
          const currentProcess = CamStreamSocketManager.process[ctrl_id][cmr_id][q];
          if (currentProcess) {
            // delete observer
            CamStreamSocketManager.unregisterObserver({ ctrl_id, cmr_id, q });
            if (currentProcess.ffmpegProcess && currentProcess.ffmpegProcess.pid !== undefined) {
              try {
                currentProcess.ffmpegProcess.kill();
              } catch (error) {
                vmsLogger.error(`Camera Stream Manager | killProcess | Error kill process | ${JSON.stringify(direction)} `, error);
              }
            }
          }
        }
      }
    }
  }
}
