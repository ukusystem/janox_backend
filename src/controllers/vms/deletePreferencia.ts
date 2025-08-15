import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Vms } from '../../models/vms';
import { RequestWithUser } from '../../types/requests';

export const deletePreferencia = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const { xprfvms_id } = req.params;
  const user = req.user!; // ! -> anteponer middleware auth
  await Vms.deletePreferencia({ prfvms_id: Number(xprfvms_id), u_id: user.u_id });
  res.json({ message: 'La preferencia de VMS ha sido eliminada con éxito.' });
});
