import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';
import type { RequestWithUser } from '../../types/requests';

export const getRegistroTickets = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { ctrl_id, offset, limit, filters } = req.query as {
    ctrl_id: string;
    offset: string;
    limit: string;
    filters?:
      | {
          state?: ('1' | '2' | '3' | '4' | '16' | '17' | '18' | '21' | '22')[] | undefined;
          dateRange?:
            | {
                end: string;
                start: string;
              }
            | undefined;
        }
      | undefined;
  }; // "/ticket/historial?ctrl_id=number&limit=number&offset=number"

  const user = req.user!; // ! -> anteponer middleware auth
  const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

  const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

  const tickets = await Ticket.getRegistrosByCtrlIdAndLimitAndOffset({ ctrl_id: Number(ctrl_id), limit: final_limit, offset: final_offset, user, filters });
  const total = await Ticket.getTotalRegistroTicketByCtrlId({ ctrl_id: Number(ctrl_id), user, filters });

  res.json({
    limit: Number(limit ?? 0),
    offset: Number(offset ?? 0),
    total_size: total,
    data_size: tickets.length,
    data: tickets,
    filters: filters,
  });
});
