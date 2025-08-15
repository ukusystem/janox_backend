import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Vms, type ConfigData } from '../../models/vms';
import { RequestWithUser } from '../../types/requests';

export const updatePreferencia = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const user = req.user!; // ! -> anteponer middleware
  const { configdata, preferencia, prfvms_id } = req.body as { configdata: ConfigData; preferencia: string; prfvms_id: number };
  await Vms.updatePreferencia({ configdata, preferencia, prfvms_id, u_id: user.u_id });
  res.json({ message: 'La preferencia de VMS ha sido actualizada exitosamente' });
});
