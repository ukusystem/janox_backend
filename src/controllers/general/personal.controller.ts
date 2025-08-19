import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { RequestWithUser } from '../../types/requests';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { InsertRecordActivity, OperationType } from '../../models/audit/audit.types';
import { AuditManager, getOldRecordValues } from '../../models/audit/audit.manager';
import { CreateEntityResponse, DeleteReponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';
import { PersonalRepository } from '../../models/general/personal/personal.repository';
import { ContrataRepository } from '../../models/general/contrata/contrata.repository';
import { UserRepository } from '../../models/general/usuario/user.repository';

import { deleteTemporalFilesMulter, MulterMiddlewareConfig } from '../../middlewares/multer.middleware';
import { getExtesionFile } from '../../utils/getExtensionFile';
import { createPersonalSchema } from '../../models/general/personal/schemas/create.personal.schema';
import { CreatePersonalDTO } from '../../models/general/personal/dtos/create.personal.dto';
import { PersonalMapManager } from '../../models/maps';
import { updatePersonalBodySchema } from '../../models/general/personal/schemas/update.personal.schema';
import { UpdatePersonalDTO } from '../../models/general/personal/dtos/update.personal.dto';
import { Personal, PersonalWithOcupation } from '../../models/general/personal/personal.entity';
import { CustomError } from '../../utils/CustomError';
import { Usuario } from '../../models/general/usuario/user.entity';
import { UserRol } from '../../types/rol';
import { AccesoRepository } from '../../models/general/Acceso/AccesoRepository';
import { CargoRepository } from '../../models/general/cargo/cargo.repository';

export class PersonalController {
  constructor(
    private readonly personal_repository: PersonalRepository,
    private readonly contrata_repository: ContrataRepository,
    private readonly user_repository: UserRepository,
    private readonly acceso_repository: AccesoRepository,
    private readonly cargo_repository: CargoRepository,
  ) {}

  static readonly CREATE_BODY_FIELDNAME: string = 'form';
  static readonly CREATE_FILE_FIELDNAME: string = 'files';

  static readonly BASE_PROFILEPHOTO_DIR: string = './archivos/personal/photos';
  static readonly BASE_PROFILEPHOTO_RELATIVE_DIR: string = './archivos/personal';

  #deleteTemporalFiles(req: Request) {
    if (req.files !== undefined) deleteTemporalFilesMulter(req.files);
    if (req.file !== undefined) deleteTemporalFilesMulter([req.file]);
  }

  #moveMulterFilePhoto(file: Express.Multer.File): string {
    const newFileName = uuidv4();
    const extensionFile = getExtesionFile(file.originalname);

    const movePath = path.resolve(`${PersonalController.BASE_PROFILEPHOTO_DIR}/${newFileName}.${extensionFile}`);

    // create directory if no exist
    const dirnamePath = path.dirname(movePath);
    if (!fs.existsSync(dirnamePath)) {
      fs.mkdirSync(dirnamePath, { recursive: true });
    }

    // move file
    fs.renameSync(file.path, movePath);

  	const relativePath = path.relative(PersonalController.BASE_PROFILEPHOTO_RELATIVE_DIR, movePath);
  	const posixPath = relativePath.split(path.sep).join(path.posix.sep); // Se normaliza la ruta a formato POSIX (con /) para consistencia en la BD y URLs.
 	console.log('Moving file to:', movePath);
  	console.log('Moving file to relative:', posixPath);

 	return posixPath;
  }

  #copyDefaultPhoto(): string {
    const newFileName = uuidv4();
    const destPath = path.resolve(`${PersonalController.BASE_PROFILEPHOTO_DIR}/${newFileName}.png`);

    // create directory if no exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const sourcePath = path.resolve('./assets/default.user.avatar.png');
    // copy file
    fs.copyFileSync(sourcePath, destPath);

    const relativePath = path.relative(`${PersonalController.BASE_PROFILEPHOTO_RELATIVE_DIR}`, destPath); // photos\41862f90-7f8f-4c89-bae6-a45c74700b68.jpeg

    const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // photos/41862f90-7f8f-4c89-bae6-a45c74700b68.jpeg

    return finalRelativePath;
  }

  get createMulterConfig(): MulterMiddlewareConfig {
    return {
      bodyFields: [PersonalController.CREATE_BODY_FIELDNAME],
      fieldConfigs: [{ field: { name: PersonalController.CREATE_FILE_FIELDNAME, maxCount: 1 }, allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'], maxFileSize: 5 * 1024 * 1024 }],
      limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024, // 5MB
        fieldSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      try {
        const formParse = JSON.parse(req.body[PersonalController.CREATE_BODY_FIELDNAME]);

        if (!formParse) {
          return res.status(400).json({ message: 'El cuerpo de la solicitud está vacío o mal formado' });
        }
        const resultParse = createPersonalSchema.safeParse(formParse);

        if (!resultParse.success) {
          this.#deleteTemporalFiles(req);
          return res.status(400).json(resultParse.error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
        }

        const { c_id, co_id, dni } = resultParse.data;

        const contrataFound = await this.contrata_repository.findWithRubroById(co_id);
        if (contrataFound === undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(404).json({ success: false, message: `Contrata no disponible.` });
        }

        const cargoFound = await this.cargo_repository.findById(c_id);
        if (cargoFound === undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(404).json({ success: false, message: `Cargo no disponible.` });
        }

        const personalFound = await this.personal_repository.findByDni(dni);
        if (personalFound !== undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(409).json({ success: false, message: `Personal con DNI ${dni} ya esta en uso.` });
        }

        const filesUploaded = req.files;
        let finalPhotoPath: string | undefined = undefined;
        if (filesUploaded !== undefined) {
          if (Array.isArray(filesUploaded)) {
            const file = filesUploaded[0]; // expected only one
            if (file !== undefined) {
              finalPhotoPath = this.#moveMulterFilePhoto(file);
            }
          } else {
            const multerFiles = filesUploaded[PersonalController.CREATE_FILE_FIELDNAME];
            if (multerFiles !== undefined) {
              const file = multerFiles[0]; // expected only one
              if (file !== undefined) {
                finalPhotoPath = this.#moveMulterFilePhoto(file);
              }
            }
          }
        }

        if (finalPhotoPath === undefined) {
          finalPhotoPath = this.#copyDefaultPhoto();
        }

        // falta validar foto
        const newPersonal: CreatePersonalDTO = {
          ...resultParse.data,
          foto: finalPhotoPath,
        };

        const personalCreated = await this.personal_repository.create(newPersonal, false);
        PersonalMapManager.add(personalCreated);

        const newActivity: InsertRecordActivity = {
          nombre_tabla: 'personal',
          id_registro: personalCreated.p_id,
          tipo_operacion: OperationType.Create,
          valores_anteriores: null,
          valores_nuevos: personalCreated,
          realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
        };

        AuditManager.generalInsert(newActivity);

        const response: CreateEntityResponse = {
          id: personalCreated.p_id,
          message: 'Personal creado satisfactoriamente',
        };

        res.status(201).json(response);
      } catch (error) {
        this.#deleteTemporalFiles(req);
        next(error);
      }
    });
  }

  get update() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
      try {
        const user = req.user;
        if (user === undefined) {
          return res.status(401).json({ message: 'No autorizado' });
        }

        if (user.rl_id !== UserRol.Administrador && user.rl_id !== UserRol.Gestor) {
          return res.status(401).json({ message: 'No autorizado' });
        }

        const { p_id } = req.params as { p_id: string };

        const personalFound = await this.personal_repository.findById(Number(p_id));
        if (personalFound === undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(400).json({ success: false, message: 'Personal no disponible' });
        }
        console.log(req.body);
        console.log(req.files);

        const formParse = JSON.parse(req.body[PersonalController.CREATE_BODY_FIELDNAME]);

        const resultParse = updatePersonalBodySchema.safeParse(formParse);
        if (!resultParse.success) {
          this.#deleteTemporalFiles(req);
          return res.status(400).json(resultParse.error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
        }

        const { co_id, c_id, dni, apellido, correo, nombre, telefono } = resultParse.data;

        const finalPersonalUpdateDTO: UpdatePersonalDTO = {};

        if (dni !== undefined && dni !== personalFound.dni) {
          const personalFoundDni = await this.personal_repository.findByDni(dni);
          if (personalFoundDni !== undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(409).json({ success: false, message: `Personal con DNI ${dni} ya esta en uso.` });
          }
          finalPersonalUpdateDTO.dni = dni;
        }

        if (c_id !== undefined && c_id !== personalFound.c_id) {
          const cargoFound = await this.cargo_repository.findById(c_id);
          if (cargoFound === undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(404).json({ success: false, message: `Cargo no disponible.` });
          }

          finalPersonalUpdateDTO.c_id = c_id;
        }

        if (co_id !== undefined && co_id !== personalFound.co_id) {
          const contrataFound = await this.contrata_repository.findById(co_id);
          if (contrataFound === undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(404).json({ success: false, message: `Contrata no disponible.` });
          }

          finalPersonalUpdateDTO.co_id = co_id;
        }

        const filesUploaded = req.files;

        if (filesUploaded !== undefined) {
          if (Array.isArray(filesUploaded)) {
            const file = filesUploaded[0]; // expected only one
            if (file !== undefined) {
              console.log('aquitengofile');

              finalPersonalUpdateDTO.foto = this.#moveMulterFilePhoto(file);
            }
          } else {
            const multerFiles = filesUploaded[PersonalController.CREATE_FILE_FIELDNAME];
            if (multerFiles !== undefined) {
              const file = multerFiles[0]; // expected only one
              if (file !== undefined) {
                console.log('aquitengofile2');

                finalPersonalUpdateDTO.foto = this.#moveMulterFilePhoto(file);
              }
            }
          }
        }

        if (apellido !== undefined && apellido !== personalFound.apellido) {
          finalPersonalUpdateDTO.apellido = apellido;
        }
        if (nombre !== undefined && nombre !== personalFound.nombre) {
          finalPersonalUpdateDTO.nombre = nombre;
        }
        if (correo !== undefined && correo !== personalFound.correo) {
          finalPersonalUpdateDTO.correo = correo;
        }
        if (telefono !== undefined && telefono !== personalFound.telefono) {
          finalPersonalUpdateDTO.telefono = telefono;
        }

        if (Object.keys(finalPersonalUpdateDTO).length > 0) {
          await this.personal_repository.update(personalFound.p_id, finalPersonalUpdateDTO);

          PersonalMapManager.update(personalFound.p_id, finalPersonalUpdateDTO);

          const oldValues = getOldRecordValues(personalFound, finalPersonalUpdateDTO);

          const newActivity: InsertRecordActivity = {
            nombre_tabla: 'personal',
            id_registro: personalFound.p_id,
            tipo_operacion: OperationType.Update,
            valores_anteriores: oldValues,
            valores_nuevos: finalPersonalUpdateDTO,
            realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
          };

          AuditManager.generalInsert(newActivity);

          const response: UpdateResponse<Personal> = {
            message: 'Personal actualizado exitosamente',
          };

          return res.status(200).json(response);
        }

        return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del personal' });
      } catch (error) {
        this.#deleteTemporalFiles(req);
        next(error);
      }
    });
  }

  get delete() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (user.rl_id !== UserRol.Administrador && user.rl_id !== UserRol.Gestor) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.personal_repository.findById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(400).json({ success: false, message: 'Personal no disponible' });
      }

      // delete: personal
      await this.personal_repository.softDelete(personalFound.p_id);

      PersonalMapManager.delete(personalFound.p_id);
      // delete: users
      const usersPersonal = await this.user_repository.findByPersonalId(personalFound.p_id);
      const usersActivity = usersPersonal.map<InsertRecordActivity>((user_item) => ({
        nombre_tabla: 'usuario',
        id_registro: user_item.u_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: user_item.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      }));

      await this.user_repository.softDeleteByPersonalId(personalFound.p_id);
      // end delete: users

      // delete : accesos
      const accesosContrata = await this.acceso_repository.findByPersonalId(personalFound.p_id);

      const accesosActivity = accesosContrata.map<InsertRecordActivity>((acceso) => ({
        nombre_tabla: 'acceso',
        id_registro: acceso.a_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: acceso.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      }));
      await this.acceso_repository.softDeleteByPersonalId(personalFound.p_id);
      // end delete : accesos

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'personal',
        id_registro: personalFound.p_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: personalFound.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalMultipleInsert([newActivity, ...usersActivity, ...accesosActivity]);

      const response: DeleteReponse = {
        message: 'Personal eliminado exitosamente',
        id: personalFound.p_id,
      };
      res.status(200).json(response);
    });
  }

  get singlePersonal() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.personal_repository.findById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(400).json({ success: false, message: 'Personal no disponible' });
      }

      const response: EntityResponse<Personal> = personalFound;
      res.status(200).json(response);
    });
  }
  get singleUserPersonal() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.user_repository.findWithRoleAndPersonalById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(400).json({ success: false, message: 'Personal no disponible' });
      }

      const response: EntityResponse<Omit<Usuario, 'contraseña'>> = personalFound;
      res.status(200).json(response);
    });
  }

  get listPersonalesOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit, name } = req.query as { limit: string | undefined; offset: string | undefined; name: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 20; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const personales = await this.personal_repository.findByOffsetPagination(final_limit, final_offset, name);
      const total = await this.personal_repository.countTotal();

      const response: OffsetPaginationResponse<Personal> = {
        data: personales,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: personales.length,
          totalCount: total,
        },
      };

      return res.json(response);
    });
  }

  get listPersonalesPorcontrataOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit, name } = req.query as { limit: string | undefined; offset: string | undefined; name: string | undefined };

      const co_id = Number((req.params as { co_id: string }).co_id);

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 50; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const personales = await this.personal_repository.findMembersByContrataId(co_id, name);
      const total = await this.personal_repository.countTotal();

      const response: OffsetPaginationResponse<PersonalWithOcupation> = {
        data: personales,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: personales.length,
          totalCount: total,
        },
      };

      return res.json(response);
    });
  }

  get getPhoto() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.personal_repository.findById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(404).json({ message: 'La foto solicitada no está disponible en el servidor.' });
      }
      const imgPathFinal = path.resolve(PersonalController.BASE_PROFILEPHOTO_RELATIVE_DIR, decodeURIComponent(personalFound.foto));

      res.sendFile(imgPathFinal, (err) => {
        if (err) {
          const errPhotoNotFound = new CustomError(`La foto solicitada no está disponible en el servidor.`, 404, 'Not Found');
          next(errPhotoNotFound);
        }
      });
    });
  }
}
