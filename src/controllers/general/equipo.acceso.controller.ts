import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { EntityResponse } from '../../types/shared';
import { EquipoAccesoRepository } from '../../models/general/equipoacceso/equipo.acceso.repository';
import { EquipoAcceso } from '../../models/general/equipoacceso/equipo.acceso.entity';

export class EquipoAccesoController {
  constructor(private readonly repository: EquipoAccesoRepository) {}

  get list() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const equiposAcceso = await this.repository.findAll();
      const response: EntityResponse<EquipoAcceso[]> = equiposAcceso;
      res.status(200).json(response);
    });
  }

  get item() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { ea_id } = req.params as { ea_id: string };
      const equipoAccesoFound = await this.repository.findById(Number(ea_id));
      if (equipoAccesoFound === undefined) {
        return res.status(400).json({ success: false, message: 'Equipo de acceso no disponible' });
      }
      const response: EntityResponse<EquipoAcceso> = equipoAccesoFound;
      res.status(200).json(response);
    });
  }
}
