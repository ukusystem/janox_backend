import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../types/requests';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { InsertRecordActivity, OperationType } from '../../models/audit/audit.types';
import { AuditManager, getOldRecordValues } from '../../models/audit/audit.manager';
import { CreateEntityResponse, DeleteReponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';

import { ContrataRepository, ContrataWithRubro } from '../../models/general/contrata/contrata.repository';
import { RubroRepository } from '../../models/general/rubro/rubro.repository';
import { PersonalRepository } from '../../models/general/personal/personal.repository';
import { UserRepository } from '../../models/general/usuario/user.repository';

import { UpdateContrataDTO } from '../../models/general/contrata/dtos/update.contrata.dto';
import { Contrata } from '../../models/general/contrata/contrata.entity';
import { PaginationContrata } from '../../models/general/contrata/schemas/pagination.contrata.schema';
import { CreateContrataBody } from '../../models/general/contrata/schemas/create.contrata.schema';
import { UpdateContrataBody } from '../../models/general/contrata/schemas/update.contrata.schema';
import { AccesoRepository } from '../../models/general/Acceso/AccesoRepository';

export class ContrataController {
  constructor(
    private readonly contrata_repository: ContrataRepository,
    private readonly rubro_repository: RubroRepository,
    private readonly personal_repository: PersonalRepository,
    private readonly user_repository: UserRepository,
    private readonly acceso_repository: AccesoRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const contrataDTO: CreateContrataBody = req.body;

      const rubroFound = await this.rubro_repository.findById(contrataDTO.r_id);
      if (rubroFound === undefined) {
        return res.status(404).json({ success: false, message: `Rubro no disponible.` });
      }

      const newContrata = await this.contrata_repository.create(contrataDTO);

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'contrata',
        id_registro: newContrata.co_id,
        tipo_operacion: OperationType.Create,
        valores_anteriores: null,
        valores_nuevos: newContrata,
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);

      const response: CreateEntityResponse = {
        id: newContrata.co_id,
        message: 'Contrata creado satisfactoriamente',
      };

      res.status(201).json(response);
    });
  }

  get update() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { co_id } = req.params as { co_id: string };
      const incommingDTO: UpdateContrataBody = req.body;

      const contrataFound = await this.contrata_repository.findById(Number(co_id));

      if (contrataFound === undefined) {
        return res.status(400).json({ success: false, message: 'Contrata no disponible' });
      }

      const finalContrataUpdateDTO: UpdateContrataDTO = {};
      const { r_id, contrata, descripcion } = incommingDTO;

      if (r_id !== undefined && r_id !== contrataFound.r_id) {
        const rubroFound = await this.rubro_repository.findById(r_id);
        if (rubroFound === undefined) {
          return res.status(404).json({ success: false, message: `Rubro no disponible.` });
        }
        finalContrataUpdateDTO.r_id = r_id;
      }

      if (contrata !== undefined && contrata !== contrataFound.contrata) {
        finalContrataUpdateDTO.contrata = contrata;
      }

      if (descripcion !== undefined && descripcion !== contrataFound.descripcion) {
        finalContrataUpdateDTO.descripcion = descripcion;
      }

      if (Object.keys(finalContrataUpdateDTO).length > 0) {
        await this.contrata_repository.update(contrataFound.co_id, finalContrataUpdateDTO);

        const oldValues = getOldRecordValues(contrataFound, finalContrataUpdateDTO);

        const newActivity: InsertRecordActivity = {
          nombre_tabla: 'contrata',
          id_registro: contrataFound.co_id,
          tipo_operacion: OperationType.Update,
          valores_anteriores: oldValues,
          valores_nuevos: finalContrataUpdateDTO,
          realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
        };

        AuditManager.generalInsert(newActivity);

        const response: UpdateResponse<Contrata> = {
          message: 'Contrata actualizado exitosamente',
        };

        return res.status(200).json(response);
      }

      return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos de la contrata' });
    });
  }

  get listContratasOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit, filters }: PaginationContrata = req.query;

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const contratas = await this.contrata_repository.findByOffsetPagination(final_limit, final_offset, filters);

      const total = await this.contrata_repository.countTotal(filters);

      const response: OffsetPaginationResponse<ContrataWithRubro> = {
        data: contratas,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: contratas.length,
          totalCount: total,
        },
      };

      return res.json(response);
    });
  }

  get delete() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { co_id } = req.params as { co_id: string };
      const contrataFound = await this.contrata_repository.findById(Number(co_id));

      if (contrataFound === undefined) {
        return res.status(400).json({ success: false, message: 'Contrata no disponible' });
      }

      // delete : contrata
      await this.contrata_repository.softDelete(contrataFound.co_id);

      // delete : personales
      const personalesContrata = await this.personal_repository.findByContrataId(contrataFound.co_id);

      const personalesActivity = personalesContrata.map<InsertRecordActivity>((personal) => ({
        nombre_tabla: 'personal',
        id_registro: personal.p_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: personal.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      }));

      await this.personal_repository.softDeleteByContrataId(contrataFound.co_id);

      // delete : users
      const usersContrata = await this.user_repository.findByContrataId(contrataFound.co_id);
      const usersActivity = usersContrata.map<InsertRecordActivity>((user_item) => ({
        nombre_tabla: 'usuario',
        id_registro: user_item.u_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: user_item.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      }));

      await this.user_repository.softDeleteByContrataId(contrataFound.co_id);

      // delete : accesos
      const accesosContrata = await this.acceso_repository.findByContrataId(contrataFound.co_id);

      const accesosActivity = accesosContrata.map<InsertRecordActivity>((acceso) => ({
        nombre_tabla: 'acceso',
        id_registro: acceso.a_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: acceso.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      }));
      await this.acceso_repository.softDeleteByContrataId(contrataFound.co_id);

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'contrata',
        id_registro: contrataFound.co_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: contrataFound.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalMultipleInsert([newActivity, ...personalesActivity, ...usersActivity, ...accesosActivity]);

      const response: DeleteReponse = {
        message: 'Contrata eliminado exitosamente',
        id: contrataFound.co_id,
      };
      res.status(200).json(response);
    });
  }

  get singleContrata() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { co_id } = req.params as { co_id: string };
      const contrataFound = await this.contrata_repository.findWithRubroById(Number(co_id));
      if (contrataFound === undefined) {
        return res.status(400).json({ success: false, message: 'Contrata no disponible' });
      }
      const totalPersonal = await this.personal_repository.countTotalByCotrataId(contrataFound.co_id);

      const response: EntityResponse<ContrataWithRubro & { total_personal: number }> = { ...contrataFound, total_personal: totalPersonal };
      res.status(200).json(response);
    });
  }
}
