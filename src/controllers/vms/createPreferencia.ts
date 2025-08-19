import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Vms, type ConfigData } from '../../models/vms';
import type { RequestWithUser } from '../../types/requests';

export const createPreferencia = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const user = req.user!; // ! -> anteponer middleware auth
  const { configdata, preferencia } = req.body as { configdata: ConfigData; preferencia: string };
  const userPreferencias = await Vms.getPreferencias({ u_id: user.u_id });

  if (userPreferencias.length < 4) {
    await Vms.createPreferencia({ configdata, preferencia, u_id: user.u_id });
    return res.json({ message: 'La preferencia de VMS se ha añadido correctamente.' });
  }

  res.status(400).json({ message: 'El numero máximo de preferencias son 4' });
});
