import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { MySQL2 } from '../../../database/mysql';
import { CustomError } from '../../../utils/CustomError';
import { Ticket } from '../../../models/ticket';
import { updateArchivosRespaldoSchema } from '../../../schemas/ticket';
import { getFormattedDate } from '../../../utils/getFormattedDateTime';
import { v4 as uuidv4 } from 'uuid';
import { getExtesionFile } from '../../../utils/getExtensionFile';
import { ensureDirExists, moveFile, toPosixPath } from '../../../utils/file';
import { deleteTemporalFilesMulter, MulterMiddlewareConfig } from '../../../middlewares/multer.middleware';
import { generateThumbs } from '../../../models/controllerapp/src/frontTools';
import { genericLogger } from '../../../services/loggers';

enum UpdateFilesTicketKeys {
  Formulario = 'formulario',
  ArchivoRespaldo = 'archivo_respaldo',
}
export const multerUpdateFilesTicketConfig: MulterMiddlewareConfig = {
  bodyFields: [UpdateFilesTicketKeys.Formulario],
  fieldConfigs: [{ field: { name: UpdateFilesTicketKeys.ArchivoRespaldo, maxCount: 5 }, allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'], maxFileSize: 10 * 1024 * 1024 }],
  limits: {
    // files: 5, // máximo 5 archivos binarios en total (suma de todos los campos)
    fileSize: 10 * 1024 * 1024, // tamaño máximo por archivo binario: 10MB
    fieldSize: 5 * 1024 * 1024, // tamaño máximo por campo de texto (ej: 'formulario'): 5MB
  },
};

export const updateArchivoRespaldo = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const cleanUp = () => {
    if (req.files) {
      deleteTemporalFilesMulter(req.files);
    }
  };

  let parsedFormulario;
  try {
    parsedFormulario = JSON.parse(req.body[UpdateFilesTicketKeys.Formulario]);
  } catch {
    cleanUp();
    return res.status(400).json({
      status: 400,
      message: `El campo '${UpdateFilesTicketKeys.Formulario}' no contiene un JSON válido.`,
    });
  }

  const result = updateArchivosRespaldoSchema.safeParse(parsedFormulario);
  if (!result.success) {
    cleanUp();
    return res.status(400).json(
      result.error.errors.map((errorDetail) => ({
        message: errorDetail.message,
        status: errorDetail.code,
      })),
    );
  }

  const formDataValid = result.data;

  const { ctrl_id, rt_id } = formDataValid;

  // const archivosCargados = req.files;
  const fileUploaded = req.files;
  const archivosData: { ruta: string; nombreoriginal: string; tipo: string; tamaño: number; thumbnail: string | null }[] = [];

  if (fileUploaded && !Array.isArray(fileUploaded)) {
    const archivoRespaldo = fileUploaded[UpdateFilesTicketKeys.ArchivoRespaldo];

    if (archivoRespaldo) {
      for (const file of archivoRespaldo) {
        const dateFormat = getFormattedDate();
        const nameFileUuid = uuidv4();
        const extensionFile = getExtesionFile(file.originalname);

        const movePath = path.resolve(`./archivos/ticket/nodo${ctrl_id}/${dateFormat}/${nameFileUuid}.${extensionFile}`);

        moveFile(file.path, movePath);

        let thumbnailPathResult: string | null = null;
        try {
          const thumbnailPath = path.resolve(`./archivos/ticket/nodo${ctrl_id}/${dateFormat}/${nameFileUuid}_thumbnail.jpg`);
          ensureDirExists(path.dirname(thumbnailPath));
          const { result, thumbBase64 } = await generateThumbs({ filepath: movePath, type: file.mimetype });

          if (result) {
            const imageBuffer = Buffer.from(thumbBase64, 'base64');
            fs.writeFileSync(thumbnailPath, imageBuffer);
            thumbnailPathResult = toPosixPath(path.relative('./archivos/ticket', thumbnailPath));
          }
        } catch (error) {
          genericLogger.error(`Error al generar y guardar el thumbnail para el archivo "${file.originalname}" (tipo: ${file.mimetype}) `, error);
        }

        const relativePath = toPosixPath(path.relative('./archivos/ticket', movePath));

        archivosData.push({
          ruta: relativePath,
          nombreoriginal: file.originalname,
          tipo: file.mimetype,
          tamaño: file.size,
          thumbnail: thumbnailPathResult,
        });
      }
    }
  }

  try {
    const values: any[] = [];

    for (const archivo of archivosData) {
      const { nombreoriginal, ruta, tipo, tamaño, thumbnail } = archivo;
      values.push(ruta, nombreoriginal, tipo, rt_id, tamaño, thumbnail);
    }

    const placeholders = archivosData.map(() => `(?, ?, ?, ?, ?, ?)`).join(', ');

    const sql = `INSERT INTO nodo${ctrl_id}.archivoticket (ruta, nombreoriginal, tipo, rt_id, tamaño, thumbnail) VALUES ${placeholders}`;

    await MySQL2.executeQuery({ sql: sql, values: values });
  } catch {
    cleanUp();
    const errInsert = new CustomError('Ocurrio un error inesperado al intentar insertar registros a la DB.', 400, 'Error no contemplado');
    return next(errInsert);
  }

  const nuevosArchivoResp = await Ticket.getArchivosCargados({ ctrl_id, rt_id });
  return res.json({ message: 'Se agregaron correctamente los nuevos archivos de respaldo.', data: nuevosArchivoResp });
});
