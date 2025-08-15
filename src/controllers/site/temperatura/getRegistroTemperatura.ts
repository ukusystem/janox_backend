import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { Temperatura } from '../../../models/site/temperatura';

export const getRegistroTemperartura = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, date, st_id } = req.query as { ctrl_id: string; date: string; st_id: string };
  const registrosTemp = await Temperatura.getRegistroTempByDay({ ctrl_id: Number(ctrl_id), st_id: Number(st_id), date: date });
  return res.json(registrosTemp);
});
