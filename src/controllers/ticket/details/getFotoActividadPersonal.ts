import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';

import { CustomError } from '../../../utils/CustomError';
import path from 'path';

export const getFotoActividadPersonal = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { imgPath } = req.query as { imgPath: string }; // imgPath is encodedURIComponent
  const imgPathFinal = path.resolve('./archivos/personal', decodeURIComponent(imgPath));

  res.sendFile(imgPathFinal, (err) => {
    if (err) {
      const errUserNotFound = new CustomError(`La imagen solicitada no está disponible en el servidor.`, 404, 'Not Found');
      next(errUserNotFound);
    }
  });
});
