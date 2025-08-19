import { Request, Response, NextFunction } from 'express';
import multer, { Options, Field } from 'multer';
import { join } from 'path';
import fs from 'fs';
import { CustomError } from '../utils/CustomError';
import { genericLogger } from '../services/loggers';

export interface MulterMiddlewareConfig {
  limits: Options['limits'];
  fieldConfigs: Array<{ field: Field; allowedMimeTypes: string[]; maxFileSize?: number }>;
  bodyFields?: string[];
}

export interface RequestMulterMiddleware extends Request {
  [key: string]: any;
}

export const multerMiddleware = (args: MulterMiddlewareConfig) => {
  const { bodyFields, limits, fieldConfigs } = args;

  const fields = fieldConfigs.map((fieldItem) => fieldItem.field);

  // Configurar el lugar de almacenamiento temporal y el nombre de archivo:
  const storageMulter = multer.diskStorage({
    destination: async (_req, _file, cb) => {
      const dirDestination = join(__dirname, `../../archivos/temporal`);

      if (!fs.existsSync(dirDestination)) {
        fs.mkdirSync(dirDestination, { recursive: true });
      }

      cb(null, dirDestination);
    },
    filename: (_req, file, cb) => {
      const fileName = `${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  });

  // Configurar limits:
  const limitsMulter = limits;

  //Configurar file filter:
  const fileFilterMulter: Options['fileFilter'] = (req, file, cb) => {
    const fieldConfig = fieldConfigs.find((fieldItem) => fieldItem.field.name === file.fieldname);

    if (!fieldConfig) {
      const err = new CustomError(`No se permite la subida de archivos para el campo '${file.fieldname}'.`, 400, 'Campo de archivo no permitido.');
      cb(err);
      return;
    }

    const allowedMimeTypes = fieldConfig.allowedMimeTypes;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      const errType = new CustomError(`Los tipos de archivo admitidos para '${file.fieldname}' son: ${allowedMimeTypes.join(', ') || 'ninguno'}.`, 400, 'Tipo de archivo no permitido.');
      cb(errType);
      return;
    }

    return cb(null, true);
  };

  // Crear una instancia de multer:
  const upload = multer({ storage: storageMulter, limits: limitsMulter, fileFilter: fileFilterMulter }).fields(fields);

  return (req: RequestMulterMiddleware, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
      const cleanUp = () => req.files && deleteTemporalFilesMulter(req.files);

      // Errores multer
      if (err instanceof multer.MulterError) {
        cleanUp();

        const fieldNamesPermitted = fieldConfigs.map((fieldItem) => fieldItem.field.name).join(', ');

        const messages: Record<string, string> = {
          LIMIT_FILE_COUNT: `Se excedió el número máximo de archivos permitidos. Solo se permiten hasta (${limitsMulter?.files ?? 'no_especificado'}) archivos en total.`,
          LIMIT_UNEXPECTED_FILE: `Se recibió un archivo inesperado en el campo '${err.field ?? 'no_definido'}'. Verifica que el campo esté permitido ( ${fieldNamesPermitted} ) y no exceda el límite máximo.`,
          LIMIT_FILE_SIZE: `Uno de los archivos supera el tamaño máximo permitido. El límite es de (${limitsMulter?.fileSize ?? 'no_especificado'}) bytes por archivo.`,
        };

        return res.status(400).json({
          error: err.code,
          message: messages[err.code] || err.message,
        });
      }

      // Errores personalizados
      if (err instanceof CustomError) {
        cleanUp();
        return res.status(err.statusCode).json({
          error: err.errorType,
          message: err.message,
        });
      }

      // Errores desconocidos
      if (err) {
        cleanUp();
        return res.status(400).json({
          error: 'UNKNOWN',
          message: err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
        });
      }

      // Validar tamaño máximos
      const fileUploaded = req.files;
      if (!Array.isArray(fileUploaded)) {
        //
        for (const fieldname in fileUploaded) {
          const files = fileUploaded[fieldname];
          const fieldConfig = fieldConfigs.find((fieldItem) => fieldItem.field.name === fieldname);
          if (fieldConfig !== undefined) {
            for (const file of files) {
              if (fieldConfig.maxFileSize && file.size > fieldConfig.maxFileSize) {
                cleanUp();
                const error = new CustomError(`El tamaño máximo permitido para '${file.fieldname}' es de ${fieldConfig.maxFileSize} bytes.`, 400, 'Tamaño de archivo excedido.');
                return next(error);
              }
            }
          }
        }
      }
      // Validar campos de texto esperados
      if (bodyFields) {
        const missingFields = bodyFields.filter((key) => !(key in req.body));
        if (missingFields.length > 0) {
          cleanUp();
          return res.status(400).json({
            error: 'CAMPOS_REQUERIDOS_FALTANTES',
            message: `Faltan los siguientes campos de texto: ${missingFields.join(', ')}`,
          });
        }
      }

      next();
    });
  };
};

export const deleteTemporalFilesMulter = (files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]) => {
  try {
    if (Array.isArray(files)) {
      for (const file of files) {
        fs.unlinkSync(file.path);
        genericLogger.info(`deleteTemporalFiles | Archivo temporal ${file.filename} eliminado`);
      }
      genericLogger.info(`deleteTemporalFiles | Todos los archivos temporales han sido eliminados correctamente`);
    } else {
      for (const fieldname in files) {
        for (const file of files[fieldname]) {
          fs.unlinkSync(file.path);
          genericLogger.info(`deleteTemporalFiles | Archivo temporal ${file.filename} eliminado`);
        }
      }
      genericLogger.info(`deleteTemporalFiles | Todos los archivos temporales han sido eliminados correctamente`);
    }
  } catch (error) {
    genericLogger.error(`deleteTemporalFiles | Error al eliminar archivos temporales`, error);
  }
};
