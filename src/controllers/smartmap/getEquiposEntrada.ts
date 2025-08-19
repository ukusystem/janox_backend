import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getEquiposEntrada = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { xctrl_id, xee_id } = req.params;
  const equiEntradas = await SmartMap.getEquiposEntradaByCtrlIdAndEquiEntId({ ctrl_id: Number(xctrl_id), ee_id: Number(xee_id) });
  res.json(equiEntradas);
});
