import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Camera } from '../../models/camera/';

export const getPresetOnvif = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { preset, cmr_id, ctrl_id } = req.query as { ctrl_id: string; cmr_id: string; preset: string };

  await Camera.presetPTZ({
    ctrl_id: Number(ctrl_id),
    cmr_id: Number(cmr_id),
    preset: Number(preset),
  });
  res.json({ message: 'Movimiento exitoso' });
});
