import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { EntityResponse } from '../../types/shared';

import { CargoRepository } from '../../models/general/cargo/cargo.repository';
import { Cargo } from '../../models/general/cargo/cargo.entity';

export class CargoController {
  constructor(private readonly repository: CargoRepository) {}

  get list() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const cargos = await this.repository.findAll();
      const response: EntityResponse<Cargo[]> = cargos;
      res.status(200).json(response);
    });
  }

  get item() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { c_id } = req.params as { c_id: string };
      const cargoFound = await this.repository.findById(Number(c_id));
      if (cargoFound === undefined) {
        return res.status(400).json({ success: false, message: 'Cargo no disponible' });
      }
      const response: EntityResponse<Cargo> = cargoFound;
      res.status(200).json(response);
    });
  }
}
