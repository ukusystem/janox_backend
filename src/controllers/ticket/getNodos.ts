import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';

export const getNodos = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const nodos = await Ticket.getNodos();
  res.json(nodos);
});
