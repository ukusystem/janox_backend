import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Camera } from '../../models/camera/';
import { CamMovement, ControlImagingDTO, ControlPTZDTO } from '../../models/camera/onvif/camera.onvif.types';

export const getControlOnvif = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { action, cmr_id, ctrl_id, movement, velocity } = req.query as { ctrl_id: string; cmr_id: string; action: string; movement: string; velocity: string };

  if (movement === 'FocusFar' || movement === 'FocusNear' || movement === 'IrisSmall' || movement === 'IrisLarge') {
    await Camera.controlImaging(Number(ctrl_id), Number(cmr_id), { action: action as ControlImagingDTO['action'], movement: movement, velocity: Number(velocity) });
    res.json({ message: 'Movimiento exitoso' });
    return;
  }

  await Camera.controlPTZ({
    action: action as ControlPTZDTO['action'],
    cmr_id: Number(cmr_id),
    ctrl_id: Number(ctrl_id),
    velocity: Number(velocity),
    movement: movement as CamMovement,
  });

  res.json({ message: 'Movimiento exitoso' });
});
