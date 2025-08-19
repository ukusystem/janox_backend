import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getEquiposSalida = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { xctrl_id, xes_id } = req.params;
  const equiSalidas = await SmartMap.getEquiposSalidaByCtrlIdAndEquiSalId({ ctrl_id: Number(xctrl_id), es_id: Number(xes_id) });
  res.json(equiSalidas);
});
