import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';

export const getRegistroTicket = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { xctrl_id } = req.params; // "/ticket/registro/:xctrl_id"
  const registroTickets = await Ticket.getTicketsByControladorId({ ctrl_id: Number(xctrl_id) });
  res.json(registroTickets);
});
