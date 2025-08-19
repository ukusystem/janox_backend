import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { EntityResponse } from '../../types/shared';
import { RubroRepository } from '../../models/general/rubro/rubro.repository';
import { Rubro } from '../../models/general/rubro/rubro.entity';

export class RubroController {
  constructor(private readonly repository: RubroRepository) {}

  get list() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const rubros = await this.repository.findAll();
      const response: EntityResponse<Rubro[]> = rubros;
      res.status(200).json(response);
    });
  }

  get item() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { r_id } = req.params as { r_id: string };
      const rubroFound = await this.repository.findById(Number(r_id));
      if (rubroFound === undefined) {
        return res.status(400).json({ success: false, message: 'Rubro no disponible' });
      }
      const response: EntityResponse<Rubro> = rubroFound;
      res.status(200).json(response);
    });
  }
}
