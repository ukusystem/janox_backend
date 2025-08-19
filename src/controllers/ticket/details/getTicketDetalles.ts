import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { Ticket } from '../../../models/ticket';
import type { RequestWithUser } from '../../../types/requests';

export const getTicketDetalles = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { ctrl_id, rt_id } = req.query as { ctrl_id: string; rt_id: string };
  const user = req.user!; // ! -> anteponer middleware auth
  const result = await Ticket.getAllTicketDetails({ ctrl_id: Number(ctrl_id), rt_id: Number(rt_id), user });
  if (result) {
    return res.json(result);
  }

  return res.status(404).json({ message: "No se encontraron detalles. Asegúrese de ingresar valores válidos para 'ctrl_id' y 'rt_id'." });
});
