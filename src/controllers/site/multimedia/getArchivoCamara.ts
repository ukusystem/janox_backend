import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { Multimedia } from '../../../models/site';
import fs from 'fs';
import path from 'path';

export const getArchivoCamara = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { cmr_id, ctrl_id, date, tipo, hour } = req.query as { ctrl_id: string; date: string; tipo: string; cmr_id: string; hour: string }; // "/site/multimedia?ctrl_id=1&cmr_id=34&date='13/11/2024'&hour=08&tipo=1"

  const archivoCamara = await Multimedia.getArchivoCamByTypeAndCtrlIdAndCmrIdAndDateAndHour({ ctrl_id: Number(ctrl_id), date: date, hour: Number(hour), tipo: Number(tipo), cmr_id: Number(cmr_id) });

  try {
    const recorFilePath = path.resolve(`./nvr/hls/nodo${ctrl_id}/camara${cmr_id}/${date}/index.m3u8`).split(path.sep).join(path.posix.sep);
    const stats = await fs.promises.stat(recorFilePath);
    const lastModified = stats.mtime;

    const newarchivoCamara = {
      rac_id: 0.5,
      cmr_id: Number(cmr_id),
      tipo: 1,
      ruta: `api/v1/vms/${ctrl_id}/${cmr_id}/${date}/index.m3u8`,
      fecha: lastModified.toISOString(),
      thumbnail: null,
      isM3u8: true,
    };
    if (Number(tipo) === 1) {
      archivoCamara.unshift(newarchivoCamara);
    }
  } catch {
    // ignoring error
  }

  return res.json(archivoCamara);
});
