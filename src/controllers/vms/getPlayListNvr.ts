import { NextFunction, Response, Request } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

export const getPlayListNvr = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  // const { ctrl_id, cmr_id, date } = req.query as {ctrl_id: string;cmr_id: string;date: string;startTime: string;endTime: string;};
  const { ctrl_id, cmr_id, date } = req.params as { ctrl_id: string; cmr_id: string; date: string };

  const recorFilePath = path.resolve(`./nvr/hls/nodo${ctrl_id}/camara${cmr_id}/${date}/index.m3u8`).split(path.sep).join(path.posix.sep);

  fs.readFile(recorFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ message: 'Playlist .m3u8 no disponible' });
    }
    try {
      if (!data.includes('#EXT-X-ENDLIST')) {
        data += '\n#EXT-X-ENDLIST';
      }
      const fileName = uuidv4();
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.m3u8"`);
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.send(data);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Error al obtener playlist.', error: error.message });
      }
      return res.status(500).json({ message: 'Error al obtener playlist.' });
    }
  });
});
