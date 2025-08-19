import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getItemContoller = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id } = req.params;
  const controlador = await SmartMap.getControladorInfoByCtrlId({ ctrl_id: Number(ctrl_id) });
  res.json(controlador);
});
