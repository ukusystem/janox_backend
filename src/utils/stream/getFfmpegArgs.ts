import { ControllerMapManager } from '../../models/maps';
import { genericLogger } from '../../services/loggers';
import { getRstpLinksByCtrlIdAndCmrId } from '../getCameraRtspLinks';

type Calidad = 'q1' | 'q2' | 'q3';
const TIMEOUT_DISCONNECT_STREAM: number = 5;

export const getFfmpegArgs = async (ctrl_id: number, cmr_id: number, q: Calidad) => {
  try {
    const ctrlConfig = ControllerMapManager.getControllerAndResolution(ctrl_id);
    if (ctrlConfig === undefined) {
      throw new Error(`Error getFfmpegArgs | Controlador ${ctrl_id} no encontrado getControllerAndResolution`);
    }
    const { resolution, controller } = ctrlConfig;
    const [rtspUrl, rtspUrlsub] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id, cmr_id);

    let ffmpegArg: string[] = [];
    if (q === 'q1') {
      ffmpegArg = [
        '-rtsp_transport',
        'tcp',
        // SE ELIMINA LA LÍNEA '-timeout' QUE CAUSA EL ERROR
        '-i',
        rtspUrl,
        '-r',
        `${controller.streamprimaryfps}`,
        '-an',
        '-vf',
        `scale=${resolution.stream_pri.ancho}:${resolution.stream_pri.altura}`,
        '-c:v',
        'mjpeg',
        '-f',
        'image2pipe',
        '-',
      ];
    }
    if (q === 'q2') {
      ffmpegArg = [
        '-rtsp_transport',
        'tcp',
        // SE ELIMINA LA LÍNEA '-timeout' QUE CAUSA EL ERROR
        '-i',
        rtspUrl,
        '-r',
        `${controller.streamsecondaryfps}`,
        '-an',
        '-vf',
        `scale=${resolution.stream_sec.ancho}:${resolution.stream_sec.altura}`,
        '-c:v',
        'mjpeg',
        '-b:v',
        '2M',
        '-f',
        'image2pipe',
        '-',
      ];
    }
    if (q === 'q3') {
      ffmpegArg = [
        '-rtsp_transport',
        'tcp',
        // SE ELIMINA LA LÍNEA '-timeout' QUE CAUSA EL ERROR
        '-i',
        rtspUrlsub,
        '-an',
        '-c:v',
        'copy',
        '-f',
        'image2pipe',
        '-',
      ];
    }
    return ffmpegArg;
  } catch (error) {
    genericLogger.error(`Error en getFfmpegArgs`, error);
    throw error;
  }
};
