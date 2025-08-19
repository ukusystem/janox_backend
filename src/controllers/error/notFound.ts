import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  const responseData = {
    requestType: req.method,
    requestPath: req.path,
    statusCode: 404,
    errorMessage: 'No se pudo encontrar el recurso solicitado',
  };

  return res.status(404).json(responseData);
};
