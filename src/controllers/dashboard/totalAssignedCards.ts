import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard, TotalDashboardResponse } from '../../models/dashboard/dashboard';
import { dashboardLogger } from '../../services/loggers';

export const totalAssignedCards = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const data = await Dashboard.countTotalAssignedCards();
    const response: TotalDashboardResponse = data;
    res.json(response);
  } catch (error) {
    dashboardLogger.error(`Error al obtener el total de tarjetas asignadas`, error);
    const responseError: TotalDashboardResponse = { data: { total: 0 } };
    res.json(responseError);
  }
});
