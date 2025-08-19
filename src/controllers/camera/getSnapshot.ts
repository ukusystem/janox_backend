import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Camera } from '../../models/camera/';

export const getSnapshot = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { cmr_id, ctrl_id } = req.query as { ctrl_id: string; cmr_id: string };
  const imgBuffer = await Camera.snapshotCapture({
    ctrl_id: Number(ctrl_id),
    cmr_id: Number(cmr_id),
  });
  res.set('Content-Type', 'image/jpeg');
  res.send(imgBuffer);
});
