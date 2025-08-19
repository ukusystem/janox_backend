import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { SmartMap } from '../../models/smartmap';

export const getEquipoEntradaDisponible = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { xctrl_id } = req.params;
  const equEntDis = await SmartMap.getEquiposEntradaDisponibleByCtrlId({ ctrl_id: Number(xctrl_id) });
  res.json(equEntDis);
});
