import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard, MaxDashboardResponse } from '../../models/dashboard/dashboard';
import { dashboardLogger } from '../../services/loggers';

export const generalMaxTemperature = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, date, monthly } = req.query as { ctrl_id: string; date: string; monthly: string };
  try {
    const data = await Dashboard.generalMaxTemperature({ ctrl_id: Number(ctrl_id), date: date, isMonthly: monthly === 'true' });
    const response: MaxDashboardResponse = data;
    res.json(response);
  } catch (error) {
    dashboardLogger.error(`Error al obtener temperatura máxima`, error);
    console.log(error);
    const responseError: MaxDashboardResponse = { data: { max: 0 } };
    res.json(responseError);
  }
});
