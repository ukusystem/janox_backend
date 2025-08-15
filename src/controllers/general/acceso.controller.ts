import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../types/requests';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { InsertRecordActivity, OperationType } from '../../models/audit/audit.types';
import { AuditManager, getOldRecordValues } from '../../models/audit/audit.manager';
import { CreateEntityResponse, DeleteReponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';

import { PersonalRepository } from '../../models/general/personal/personal.repository';
import { EquipoAccesoRepository } from '../../models/general/equipoacceso/equipo.acceso.repository';

import { Acceso } from '../../models/general/Acceso/Acceso';
import { AccesoRepository } from '../../models/general/Acceso/AccesoRepository';
import { CreateAccesoDTO } from '../../models/general/Acceso/dtos/CreateAccesoDTO';
import { UpdateAccesoDTO } from '../../models/general/Acceso/dtos/UpdateAccesoDTO';
import fs from 'fs/promises';
import { ImportAccesoDTO } from '../../models/general/Acceso/dtos/ImportAccesoDTO';
export class AccesoController {
  constructor(
    private readonly acceso_repository: AccesoRepository,
    private readonly personal_repository: PersonalRepository,
    private readonly equipoacceso_repository: EquipoAccesoRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const accesoDTO: CreateAccesoDTO = req.body;

      const accesoFound = await this.acceso_repository.findBySerie(accesoDTO.serie);
      if (accesoFound !== undefined) {
        return res.status(409).json({ success: false, message: `Acceso con serie ${accesoDTO.serie} ya esta en uso.` });
      }

      const personalFound = await this.personal_repository.findById(accesoDTO.p_id);
      if (personalFound === undefined) {
        return res.status(404).json({ success: false, message: `Personal no disponible.` });
      }

      const equipoAccesoFound = await this.equipoacceso_repository.findById(accesoDTO.ea_id);
      if (equipoAccesoFound === undefined) {
        return res.status(404).json({ success: false, message: `Equipo Acceso no disponible.` });
      }
      const idInactiveAccess = await this.acceso_repository.findInactive();

      if (idInactiveAccess === undefined) {
        return res.status(404).json({ success: false, message: `No hay espacio para tarjetas disponible.` });
      }
      const accessToCreate: UpdateAccesoDTO = {
        ...accesoDTO,
        activo: 1,
        created_at: new Date(),
      };
      await this.acceso_repository.update(idInactiveAccess, accessToCreate);

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'acceso',
        id_registro: idInactiveAccess,
        tipo_operacion: OperationType.Create,
        valores_anteriores: null,
        valores_nuevos: accesoDTO,
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);
      //TODO: Comunicación con el controlador
      //updateAccessController(idInactiveAccess, accessToCreate)
      const response: CreateEntityResponse = {
        id: idInactiveAccess,
        message: 'Acceso creado satisfactoriamente',
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

      const { a_id } = req.params as { a_id: string };

      const incommingDTO: UpdateAccesoDTO = req.body;

      const accesoFound = await this.acceso_repository.findById(Number(a_id));
      if (accesoFound === undefined) {
        return res.status(404).json({ success: false, message: `Acceso no disponible` });
      }

      const finalUpdateAccesoDTO: UpdateAccesoDTO = {};
      const { serie, p_id, ea_id, administrador } = incommingDTO;

      if (serie !== undefined && serie !== accesoFound.serie) {
        const accesoFoundSerie = await this.acceso_repository.findBySerie(serie);
        if (accesoFoundSerie !== undefined) {
          return res.status(409).json({ success: false, message: `Acceso con serie ${serie} ya esta en uso.` });
        }
        finalUpdateAccesoDTO.serie = serie;
      }

      if (p_id !== undefined && p_id !== accesoFound.p_id) {
        const personalFound = await this.personal_repository.findById(p_id);
        if (personalFound === undefined) {
          return res.status(404).json({ success: false, message: `Personal no disponible.` });
        }
        finalUpdateAccesoDTO.p_id = p_id;
      }

      if (ea_id !== undefined && ea_id !== accesoFound.ea_id) {
        const equipoAccesoFound = await this.equipoacceso_repository.findById(ea_id);
        if (equipoAccesoFound === undefined) {
          return res.status(404).json({ success: false, message: `Equipo Acceso no disponible.` });
        }
        finalUpdateAccesoDTO.ea_id = ea_id;
      }

      if (administrador !== undefined && administrador !== accesoFound.administrador) {
        finalUpdateAccesoDTO.administrador = administrador;
      }

      if (Object.keys(finalUpdateAccesoDTO).length > 0) {
        await this.acceso_repository.update(accesoFound.a_id, finalUpdateAccesoDTO);

        const oldValues = getOldRecordValues(accesoFound, finalUpdateAccesoDTO);

        const newActivity: InsertRecordActivity = {
          nombre_tabla: 'acceso',
          id_registro: accesoFound.a_id,
          tipo_operacion: OperationType.Update,
          valores_anteriores: oldValues,
          valores_nuevos: finalUpdateAccesoDTO,
          realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
        };

        AuditManager.generalInsert(newActivity);
        //TODO: Comunicación con el controlador
        //updateAccessController(accesoFound.a_id, finalUpdateAccesoDTO)
        const response: UpdateResponse<Acceso> = {
          message: 'Acceso actualizado exitosamente',
        };
        return res.status(200).json(response);
      }

      return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del acceso' });
    });
  }

  get listAccesosOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const accesos = await this.acceso_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.acceso_repository.countTotal();
      const response: OffsetPaginationResponse<Acceso> = {
        data: accesos,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: accesos.length,
          totalCount: total,
        },
      };

      return res.json(response);
    });
  }
  get listAccesosWithPersonalOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit, serie } = req.query as { limit: string | undefined; offset: string | undefined; serie: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const accesos = await this.acceso_repository.findWithPersonalByOffsetPagination(final_limit, final_offset, serie);
      const total = await this.acceso_repository.countTotal();
      const response: OffsetPaginationResponse<Acceso> = {
        data: accesos,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: accesos.length,
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

      const { a_id } = req.params as { a_id: string };
      const accesoFound = await this.acceso_repository.findById(Number(a_id));
      if (accesoFound === undefined) {
        return res.status(400).json({ success: false, message: 'Acceso no disponible' });
      }
      await this.acceso_repository.softDelete(Number(a_id));

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'acceso',
        id_registro: accesoFound.a_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: accesoFound.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);
      //TODO: Comunicacion con el controlador
      //deleteAccessController(Number(a_id))
      const response: DeleteReponse = {
        message: 'Acceso eliminado exitosamente',
        id: Number(a_id),
      };
      res.status(200).json(response);
    });
  }

  get singleAcceso() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { a_id } = req.params as { a_id: string };
      const accesoFound = await this.acceso_repository.findById(Number(a_id));
      if (accesoFound === undefined) {
        return res.status(400).json({ success: false, message: 'Acceso no disponible' });
      }
      const response: EntityResponse<Acceso> = accesoFound;
      res.status(200).json(response);
    });
  }
  get getAccessToJson() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      console.log('llegue aqui');

      const accesos = await this.acceso_repository.getAllAccessToJson();
      const response: Acceso[] = accesos;
      if (!response || response.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay datos para exportar' });
      }
      res.setHeader('Content-Disposition', 'attachment; filename=accesos.json');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response, null, 2));
    });
  }

  get importAccessData() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const MAX_ACCESS_COUNT = parseInt(process.env.MAX_ACCESS_COUNT || '100', 10);
      console.log(MAX_ACCESS_COUNT);

      //Validación básica del archivo
      const filesUploaded = req.files as { [fieldname: string]: Express.Multer.File[] };

      const file = filesUploaded?.files?.[0];
      if (!file) {
        return res.status(400).json({ message: 'Archivo no encontrado' });
      }

      const filePath = file.path;
      //Lectura y parseo del archivo JSON
      const rawData = await fs.readFile(filePath, 'utf-8');
      const data: ImportAccesoDTO[] = JSON.parse(rawData);

      if (!Array.isArray(data) || data.length === 0) {
        await fs.unlink(filePath);
        return res.status(400).json({ message: 'El archivo JSON está vacío o malformado' });
      }
      //Validación de estructura de cada registro
      const allValidStructure = data.every((d) => typeof d.serie === 'number' && typeof d.administrador === 'number' && typeof d.p_id === 'number' && typeof d.ea_id === 'number' && typeof d.activo === 'number');
      if (!allValidStructure) {
        await fs.unlink(filePath);
        return res.status(400).json({ message: 'Estructura de datos inválida en el archivo' });
      }

      //Extracción de IDs únicos
      const eaIds = [...new Set(data.map((d) => d.ea_id))];
      const pIds = [...new Set(data.map((d) => d.p_id))];

      const validEaIds = new Set(await this.acceso_repository.findTipoAccesoByIds(eaIds));
      const validPIds = new Set(await this.acceso_repository.findPersonalByIds(pIds));

      const validData = data.filter((d) => validEaIds.has(d.ea_id) && validPIds.has(d.p_id));
      if (validData.length === 0) {
        await fs.unlink(filePath);
        return res.status(400).json({ message: 'No hay datos válidos para insertar' });
      }

      // Relleno con datos por defecto si no alcanza el máximo
      const recordsToInsert: ImportAccesoDTO[] = [...validData];

      const missingCount = MAX_ACCESS_COUNT - recordsToInsert.length;

      for (let i = 0; i < missingCount; i++) {
        recordsToInsert.push({
          serie: 1,
          administrador: 0,
          p_id: 1,
          ea_id: 1,
          activo: 0,
        });
      }

      // Asegurarse de que siempre se inserten MAX_ACCESS_COUNT
      if (recordsToInsert.length > MAX_ACCESS_COUNT) {
        recordsToInsert.length = MAX_ACCESS_COUNT;
      }

      await this.acceso_repository.deleteAllAccess();
      await this.acceso_repository.insertAccessBulk(recordsToInsert);
      await fs.unlink(filePath);
      //TODO: Comunicación con el controlador
      // pasaré recordsToInsert ={
      // serie: number,
      // administrador: number,
      // p_id: number,
      // ea_id: number,
      // activo: number,}
      //importDataToController(recordsToInsert);
      res.status(200).json({
        message: `Importación completada. Insertados: ${recordsToInsert.length}`,
      });
    });
  }
}
