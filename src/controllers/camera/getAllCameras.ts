import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Camera } from '../../models/camera/';

export const getAllCameras = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const allCamerasData = await Camera.getAllCameras();
  res.json(allCamerasData);
});
