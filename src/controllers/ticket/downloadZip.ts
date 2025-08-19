import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import path from 'path';
import { Ticket } from '../../models/ticket';
import archiver from 'archiver';
import { genericLogger } from '../../services/loggers';

export const downloadZip = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  //  GET /tickets/{rt_id}/download-zip?ctrl_id=1
  const { rt_id } = req.params as { rt_id: string };
  const { ctrl_id } = req.query as { ctrl_id: string };

  const ticketFiles = await Ticket.getArchivosCargados({
    ctrl_id: Number(ctrl_id),
    rt_id: Number(rt_id),
  });

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.on('error', (err) => {
    genericLogger.error('Error al comprimir los archivos', err.message);
    res.status(500).send({ error: 'Error al comprimir los archivos' });
  });

  archive.on('end', () => {
    genericLogger.info(`Archivo ZIP generado con éxito | ctrl_id : ${ctrl_id} |rt_id : ${rt_id}`);
  });

  res.attachment(`archivo_respaldo_${ctrl_id}_${rt_id}_${Date.now()}.zip`);

  archive.pipe(res);

  ticketFiles.forEach((file, index) => {
    const filePath = path.resolve('./archivos/ticket/', file.ruta);
    archive.file(filePath, { name: `${index + 1}_${file.nombreoriginal}` });
  });

  archive.finalize();
});
