import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';

export const getTipoTrabajo = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const tiposTrabajo = await Ticket.getTiposTrabajo();
  res.json(tiposTrabajo);
});
