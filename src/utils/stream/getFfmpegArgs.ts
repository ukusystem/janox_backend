import { genericLogger } from '../../services/loggers';
import { getRstpLinksByCtrlIdAndCmrId } from '../getCameraRtspLinks';
import { CustomError } from '../CustomError';

type Calidad = 'q1' | 'q2' | 'q3';

export const getFfmpegArgs = async (ctrl_id: number, cmr_id: number, q: Calidad): Promise<string[]> => {
    try {
        // Obtenemos las URLs RTSP directamente, que es lo correcto.
        const [rtspUrl, rtspUrlsub] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id, cmr_id);

        let ffmpegArg: string[] = [];

        // Ya no dependemos de ControllerMapManager, usamos valores estándar.
        if (q === 'q1') {
            ffmpegArg = [
                '-rtsp_transport', 'tcp',
                '-i', rtspUrl,
                '-r', '15', // Usamos un valor fijo y razonable: 15 FPS
                '-an',
                '-vf', 'scale=1280:720', // Usamos una resolución fija HD
                '-c:v', 'mjpeg',
                '-f', 'mjpeg',
                'pipe:1',
            ];
        } else if (q === 'q2') {
            ffmpegArg = [
                '-rtsp_transport', 'tcp',
                '-i', rtspUrlsub, // Usamos el substream para calidad media
                '-r', '15',
                '-an',
                '-vf', 'scale=640:360', // Usamos una resolución fija SD
                '-c:v', 'mjpeg',
                '-f', 'mjpeg',
                'pipe:1',
            ];
        } else { // q3
            ffmpegArg = [
                '-rtsp_transport', 'tcp',
                '-i', rtspUrlsub,
                '-an',
                '-c:v', 'mjpeg',
                '-vf', 'scale=320:180', // La calidad más baja
                '-f', 'mjpeg',
                'pipe:1',
            ];
        }
        return ffmpegArg;
    } catch (error) {
        genericLogger.error(`Error en getFfmpegArgs`, error);
        throw error;
    }
};