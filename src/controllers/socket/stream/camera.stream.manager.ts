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

    // Se verifica si ya existe un proceso para no duplicarlo.
    if (CamStreamSocketManager.process[ctrl_id]?.[cmr_id]?.[q]) {
        vmsLogger.info(`Proceso FFmpeg para cmr_id ${cmr_id} y calidad ${q} ya existe. Saltando creación.`);
        return;
    }

    try {
        CamStreamSocketManager.notifyState(direction, true, 'isLoading');

        const ffmpegPath = '/usr/bin/ffmpeg'; // Asegúrate que esta es la ruta correcta de 'which ffmpeg'
        const ffmpegArgs = await getFfmpegArgs(ctrl_id, cmr_id, q);

        vmsLogger.info(`[DEBUG] Ejecutando comando: ${ffmpegPath} ${ffmpegArgs.join(' ')}`);

        const newFfmpegProcess = spawn(ffmpegPath, ffmpegArgs, {
            stdio: ['ignore', 'pipe', 'ignore'], // Se restaura stdio para silenciar el log de progreso.
            windowsHide: true
        });

        newFfmpegProcess.stdout.on('data', (data: Buffer) => {
            const processData = CamStreamSocketManager.process[ctrl_id]?.[cmr_id]?.[q];
            if (processData) {
                CamStreamSocketManager.notifyState(direction, false, 'isLoading');
                CamStreamSocketManager.notifyState(direction, true, 'isSuccess');
                
                // Lógica para ensamblar y enviar los frames de video
                const isMarkStart = verifyImageMarkers(data, 'start');
                const isMarkEnd = verifyImageMarkers(data, 'end');

                if (!processData.isChunkInFrame && isMarkStart) {
                    processData.isChunkInFrame = true;
                }
                if (processData.isChunkInFrame) {
                    processData.bufferFrame = Buffer.concat([processData.bufferFrame, data]);
                    if (verifyImageMarkers(processData.bufferFrame, 'complete')) {
                        const imageBase64 = createImageBase64(processData.bufferFrame);
                        CamStreamSocketManager.notifyFlux(direction, imageBase64);
                        processData.bufferFrame = Buffer.alloc(0); // Limpiar buffer después de enviar
                        processData.isChunkInFrame = false;
                    }
                }
                if (isMarkEnd) { // Si llega un 'end' sin un 'start', limpiamos por si acaso.
                    processData.bufferFrame = Buffer.alloc(0);
                    processData.isChunkInFrame = false;
                }
            }
        });

        newFfmpegProcess.on('close', (code, signal) => {
            vmsLogger.info(`[FFMPEG ON CLOSE]: Proceso cerrado. Código: ${code}, Señal: ${signal}`);
            // Limpiar el proceso del mapa para que pueda ser recreado.
            if (CamStreamSocketManager.process[ctrl_id]?.[cmr_id]?.[q]) {
                delete CamStreamSocketManager.process[ctrl_id][cmr_id][q];
            }
            CamStreamSocketManager.notifyState(direction, false, 'isSuccess');
            CamStreamSocketManager.notifyState(direction, false, 'isLoading');
            CamStreamSocketManager.notifyState(direction, true, 'isError');
            CamStreamSocketManager.notifyError(direction, `Stream de cámara ${cmr_id} detenido.`);
        });

        newFfmpegProcess.on('error', (err) => {
            vmsLogger.error(`[FFMPEG ON ERROR]: Proceso falló al iniciar. Error: ${err.message}`);
        });
        
        // Se asegura que los objetos anidados existan antes de asignar el proceso
        if (!CamStreamSocketManager.process[ctrl_id]) {
            CamStreamSocketManager.process[ctrl_id] = {};
        }
        if (!CamStreamSocketManager.process[ctrl_id][cmr_id]) {
            CamStreamSocketManager.process[ctrl_id][cmr_id] = {};
        }

        // Se guarda el proceso en el mapa
        CamStreamSocketManager.process[ctrl_id][cmr_id][q] = {
            ffmpegProcess: newFfmpegProcess,
            isChunkInFrame: false,
            bufferFrame: Buffer.alloc(0),
        };

    } catch (error: any) {
        vmsLogger.error(`Error al crear proceso FFmpeg para [${ctrl_id}][${cmr_id}][${q}]: ${error.message}`);
        CamStreamSocketManager.notifyState(direction, false, 'isLoading');
        CamStreamSocketManager.notifyState(direction, true, 'isError');
        CamStreamSocketManager.notifyError(direction, 'Error al iniciar el stream.');
    }
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
