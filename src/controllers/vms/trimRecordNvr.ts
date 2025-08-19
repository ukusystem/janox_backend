import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { RequestWithUser } from '../../types/requests';
import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'node:child_process';
import { genericLogger } from '../../services/loggers';

export const trimRecordNvr = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { ctrl_id, cmr_id, date, endTime, startTime } = req.query as { ctrl_id: string; cmr_id: string; date: string; startTime: string; endTime: string };

  const [hr_inicio, min_inicio, sec_inicio] = startTime.split(':');
  const [hr_final, min_final, sec_final] = endTime.split(':');
  const startTimeSeconds = parseInt(hr_inicio, 10) * 60 * 60 + parseInt(min_inicio, 10) * 60 + parseInt(sec_inicio, 10);
  const endTimeSeconds = parseInt(hr_final, 10) * 60 * 60 + parseInt(min_final, 10) * 60 + parseInt(sec_final, 10);
  if (endTimeSeconds <= startTimeSeconds) {
    return res.status(400).json({ message: "'endTime' debe ser mayor a 'startTime'" });
  }
  if (endTimeSeconds - startTimeSeconds > 30 * 60) {
    return res.status(400).json({ message: 'Tiempo máximo de recorte permitido 30min .' });
  }

  const playlistPath = path.resolve(`./nvr/hls/nodo${ctrl_id}/camara${cmr_id}/${date}/index.m3u8`).split(path.sep).join(path.posix.sep);

  const temporalNamePlaylist = uuidv4();
  const temporalPlaylistPath = path.resolve(`./nvr/hls/nodo${ctrl_id}/camara${cmr_id}/${date}/${temporalNamePlaylist}.m3u8`).split(path.sep).join(path.posix.sep);

  const temporalNameVideo = uuidv4();
  const temporalVideoPath = path.resolve('./archivos/temporal', `${temporalNameVideo}.mp4`).split(path.sep).join(path.posix.sep);

  fs.readFile(playlistPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ message: 'Grabación no disponible.' });
    }
    try {
      if (!data.includes('#EXT-X-ENDLIST')) {
        data += '\n#EXT-X-ENDLIST';
      }
      genericLogger.info(`trimRecordNvr | Creando temporal playlist | ${temporalNamePlaylist}.m3u8`);
      fs.writeFileSync(temporalPlaylistPath, data);

      const basePath = path.resolve('./archivos/temporal');

      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
      }

      const keyArgs: string[] = ['-i', `${temporalPlaylistPath}`, '-ss', `${startTime}`, '-to', `${endTime}`, '-c', 'copy', `${temporalVideoPath}`];

      const ffmpegProcess = spawn('ffmpeg', keyArgs, { stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true });
      genericLogger.info(`trimRecordNvr | Proceso ffmpeg ejecutando | pid ${ffmpegProcess.pid}`);

      ffmpegProcess.on('close', (code, signal) => {
        genericLogger.info(`trimRecordNvr | Proceso cerrado con codigo ${code} y señal ${signal}`);
        res.download(temporalVideoPath, (err) => {
          if (err) {
            res.status(500).json({ message: 'Error al enviar el archivo.' });
          }

          fs.unlink(temporalVideoPath, (err) => {
            if (err) {
              genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal .mp4`, err);
            }
            genericLogger.info(`trimRecordNvr | Video temporal ${temporalNameVideo}.mp4 eliminado correctamente`);
          });
          fs.unlink(temporalPlaylistPath, (err) => {
            if (err) {
              genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal .m3u8`, err);
            }
            genericLogger.info(`trimRecordNvr | Playlist temporal ${temporalNamePlaylist}.m3u8 eliminado correctamente`);
          });
        });
      });

      ffmpegProcess.on('error', (err) => {
        genericLogger.error(`trimRecordNvr | Error al cortar grabacion`, err);
        res.status(500).json({ message: 'Error al cortar grabación.' });
        fs.unlink(temporalVideoPath, (err) => {
          if (err) {
            genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal`, err);
          }
          genericLogger.info(`trimRecordNvr | Video temporal ${temporalNameVideo}.mp4 eliminado correctamente`);
        });
        fs.unlink(temporalPlaylistPath, (err) => {
          if (err) {
            genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal .m3u8`, err);
          }
          genericLogger.info(`trimRecordNvr | Playlist temporal ${temporalNamePlaylist}.m3u8 eliminado correctamente`);
        });
      });
    } catch (error) {
      genericLogger.error(`trimRecordNvr | Error al recortar`, error);
      fs.unlink(temporalVideoPath, (err) => {
        if (err) {
          genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal`, err);
        }
        genericLogger.info(`trimRecordNvr | Video temporal ${temporalNameVideo}.mp4 eliminado correctamente`);
      });
      fs.unlink(temporalPlaylistPath, (err) => {
        if (err) {
          genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal .m3u8`, err);
        }
        genericLogger.info(`trimRecordNvr | Playlist temporal ${temporalNamePlaylist}.m3u8 eliminado correctamente`);
      });
      return res.status(500).json({ message: 'Error al cortar grabación.' });
    }
  });
});
