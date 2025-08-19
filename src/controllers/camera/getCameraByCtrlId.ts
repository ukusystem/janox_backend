import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Camera } from '../../models/camera/';

export const getCameraByCtrlId = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { xctrl_id } = req.params;
  const cameras = await Camera.getCameraByCtrlId({ ctrl_id: Number(xctrl_id) });
  res.json(cameras);
});
