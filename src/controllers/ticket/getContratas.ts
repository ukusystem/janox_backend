import { Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';
import { RequestWithUser } from '../../types/requests';
import { UserRol } from '../../types/rol';

export const getContratas = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const user = req.user;
  if (user !== undefined) {
    const contratas = await Ticket.getContratas();
    if (user.rl_id === UserRol.Gestor || user.rl_id === UserRol.Administrador) {
      return res.json(contratas);
    }
    const contFiltered = contratas.filter((contrata) => contrata.co_id === user.co_id);
    return res.json(contFiltered);
  }
  return res.json([]);
});
