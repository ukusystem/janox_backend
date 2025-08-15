import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Init } from '../../models/init';

export const getControladores = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const controles = await Init.getControladores();
  res.json(controles);
});
