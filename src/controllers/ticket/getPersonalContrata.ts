import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';

export const getPersonalContrata = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { xco_id } = req.params; // "/ticket/personal/:xco_id"
  const personalContrata = await Ticket.getPersonalesByContrataId({ co_id: Number(xco_id) });
  res.json(personalContrata);
});
