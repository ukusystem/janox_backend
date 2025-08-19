import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';
import { RequestWithUser } from '../../types/requests';

export const getSingleRegistroTicket = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { rt_id } = req.params;
  const { ctrl_id } = req.query as { ctrl_id: string };
  const user = req.user!; // ! -> anteponer middleware auth
  const singleTicket = await Ticket.getSingleRegistroTicketByCtrlIdAndRtId({ ctrl_id: Number(ctrl_id), rt_id: Number(rt_id), user });
  res.json(singleTicket);
});
