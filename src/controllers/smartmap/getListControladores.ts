import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getListControllers = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const controlador = await SmartMap.getAllControllers();
  res.json(controlador);
});
