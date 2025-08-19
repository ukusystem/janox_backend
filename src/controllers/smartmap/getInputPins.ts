import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getInputPins = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { ctrl_id } = req.params;
  const listInputPin = await SmartMap.getInputPins(Number(ctrl_id));
  res.json(listInputPin);
});
