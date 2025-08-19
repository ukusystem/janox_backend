import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../utils/CustomError';
import { genericLogger } from '../../services/loggers';
export const globalError = (error: CustomError | Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomError) {
    // Error personalizado
    return res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  }

  if (error instanceof SyntaxError) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }

  if ('type' in error) {
    // PayloadTooLargeError
    if (error.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'PayloadTooLargeError',
        message: 'La carga útil de la solicitud es demasiado grande. El tamaño máximo permitido es de 10 MB.',
      });
    }
  }

  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }

  // Errores no controlados
  genericLogger.error('Error interno del servidor', error);
  return res.status(500).json({ status: 500, message: 'Internal Server Error' });
};
