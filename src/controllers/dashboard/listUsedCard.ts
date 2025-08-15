import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard } from '../../models/dashboard/dashboard';

export const listUsedCard = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { offset, limit, ctrl_id, date, monthly } = req.query as { limit: string | undefined; offset: string | undefined; ctrl_id: string; date: string; monthly: string };

  const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

  const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

  const regAccesos = await Dashboard.listUsedCards({ offset: final_offset, limit: final_limit, ctrl_id: Number(ctrl_id), date, isMonthly: monthly === 'true' });
  const total = await Dashboard.countTotalUsedCards({ ctrl_id: Number(ctrl_id), date, isMonthly: monthly === 'true' });

  const response = {
    data: regAccesos,
    meta: {
      limit: final_limit,
      offset: final_offset,
      currentCount: regAccesos.length,
      totalCount: total,
    },
  };

  return res.json(response);
});
