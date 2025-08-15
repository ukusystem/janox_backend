import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';

export const getCargos = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const cargos = await Ticket.getCargos();
  res.json(cargos);
});
