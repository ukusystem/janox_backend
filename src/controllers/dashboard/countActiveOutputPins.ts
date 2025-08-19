import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard, TotalDashboardResponse } from '../../models/dashboard/dashboard';
import { dashboardLogger } from '../../services/loggers';

export const countActiveOutputPins = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, date, monthly } = req.query as { ctrl_id: string; date: string; monthly: string };
  try {
    const data = await Dashboard.countTotalActiveOutputPins({ ctrl_id: Number(ctrl_id), date: date, isMonthly: monthly === 'true' });
    const response: TotalDashboardResponse = data;
    res.json(response);
  } catch (error) {
    dashboardLogger.error(`Error al obtener el total de activaciones de los pines de salida`, error);
    const responseError: TotalDashboardResponse = { data: { total: 0 } };
    res.json(responseError);
  }
});
