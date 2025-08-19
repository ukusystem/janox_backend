import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getOutputPins = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id } = req.params;
  const listOutputPin = await SmartMap.getOutputPins(Number(ctrl_id));
  res.json(listOutputPin);
});
