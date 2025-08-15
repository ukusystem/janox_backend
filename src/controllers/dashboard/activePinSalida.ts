import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard } from '../../models/dashboard/dashboard';
import { dashboardLogger } from '../../services/loggers';

export const activePinSalida = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id, date, monthly } = req.query as { ctrl_id: string; date: string; monthly: string };
  try {
    const data = await Dashboard.getTotalActivePinSalida({ ctrl_id: Number(ctrl_id), date: date, isMonthly: monthly === 'true' });
    res.json(data);
  } catch (error) {
    dashboardLogger.error(`Error al obtener pines activos de salida`, error);
    res.json([]);
  }
});
