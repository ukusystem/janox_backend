import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard } from '../../models/dashboard/dashboard';

export const maxTemperaturaSensor = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, date, monthly } = req.query as { ctrl_id: string; date: string; monthly: string };
  const data = await Dashboard.getMaxSensorTemperatura({ ctrl_id: Number(ctrl_id), date: date, isMonthly: monthly === 'true' });
  res.json(data);
});
