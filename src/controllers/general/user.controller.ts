import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../types/requests';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { InsertRecordActivity, OperationType } from '../../models/audit/audit.types';
import { AuditManager, getOldRecordValues } from '../../models/audit/audit.manager';
import { CreateEntityResponse, DeleteReponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';
import { UserRepository, UserWithRoleAndPersonal } from '../../models/general/usuario/user.repository';
import { PasswordHasher } from '../../models/general/usuario/security/passwod.hasher';
import { PersonalRepository } from '../../models/general/personal/personal.repository';
import { RolRepository } from '../../models/general/rol/rol.repository';
import { UpdateUserDTO } from '../../models/general/usuario/dtos/update.user.dto';
import { Usuario } from '../../models/general/usuario/user.entity';
import { CreateUserBody } from '../../models/general/usuario/schemas/create.user.schema';
import { UpdateUserBody } from '../../models/general/usuario/schemas/update.user.schema';
import { UserRol } from '../../types/rol';

export class UserController {
  constructor(
    private readonly user_repository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly personal_repository: PersonalRepository,
    private readonly rol_repository: RolRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (user.rl_id !== UserRol.Administrador && user.rl_id !== UserRol.Gestor) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const userDTO: CreateUserBody = req.body;

      const isUsernameAvailable = await this.user_repository.isUsernameAvailable(userDTO.usuario);
      if (!isUsernameAvailable) {
        return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
      }

      const foundPersonal = await this.personal_repository.findById(userDTO.p_id);
      if (foundPersonal === undefined) {
        return res.status(404).json({ success: false, message: `Personal no encontrado.` });
      }

      const isPersonalAvaible = await this.user_repository.isPersonalAvailable(userDTO.p_id);
      if (!isPersonalAvaible) {
        return res.status(409).json({ success: false, message: 'El personal ya tiene asignado un usuario. Por favor, elige otro.' });
      }

      const foundRol = await this.rol_repository.findById(userDTO.rl_id);
      if (foundRol === undefined) {
        return res.status(500).json({ success: false, message: `Rol no disponible.` });
      }

      const passwordHashed = await this.hasher.hash(userDTO.contraseña);

      const newUser = await this.user_repository.create({ ...userDTO, contraseña: passwordHashed });

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'usuario',
        id_registro: newUser.u_id,
        tipo_operacion: OperationType.Create,
        valores_anteriores: null,
        valores_nuevos: newUser,
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);

      const response: CreateEntityResponse = {
        id: newUser.u_id,
        message: 'Usuario creado satisfactoriamente',
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

      if (user.rl_id !== UserRol.Administrador && user.rl_id !== UserRol.Gestor) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      // params
      const { u_id } = req.params as { u_id: string };
      // body
      const incommingDTO: UpdateUserBody = req.body;
      const { contraseña, usuario, p_id, rl_id } = incommingDTO;
      const finalUserUpdateDTO: UpdateUserDTO = {};

      const userFound = await this.user_repository.findById(Number(u_id));
      if (userFound === undefined) {
        return res.status(400).json({ success: false, message: 'Usuario no disponible' });
      }

      if (usuario !== undefined && usuario !== userFound.usuario) {
        const isUsernameAvailable = await this.user_repository.isUsernameAvailable(usuario);
        if (!isUsernameAvailable) {
          return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
        }
        finalUserUpdateDTO.usuario = usuario;
      }

      if (p_id !== undefined && p_id !== userFound.p_id) {
        const foundPersonal = await this.personal_repository.findById(p_id);
        if (foundPersonal === undefined) {
          return res.status(404).json({ success: false, message: `Personal no encontrado.` });
        }

        const isPersonalAvaible = await this.user_repository.isPersonalAvailable(p_id);
        if (!isPersonalAvaible) {
          return res.status(409).json({ success: false, message: 'El personal ya tiene asignado un usuario. Por favor, elige otro.' });
        }
        finalUserUpdateDTO.p_id = p_id;
      }

      if (rl_id !== undefined && rl_id !== userFound.rl_id) {
        const foundRol = await this.rol_repository.findById(rl_id);
        if (foundRol === undefined) {
          return res.status(404).json({ success: false, message: `Rol no encontrado.` });
        }

        finalUserUpdateDTO.rl_id = rl_id;
      }

      if (contraseña !== undefined) {
        const isSamePassword = await this.hasher.compare(contraseña, userFound.contraseña);
        if (!isSamePassword) {
          finalUserUpdateDTO.contraseña = await this.hasher.hash(contraseña);
        }
      }

      if (Object.keys(finalUserUpdateDTO).length > 0) {
        await this.user_repository.update(userFound.u_id, finalUserUpdateDTO);

        const oldValues = getOldRecordValues(userFound, finalUserUpdateDTO);

        const newActivity: InsertRecordActivity = {
          nombre_tabla: 'usuario',
          id_registro: userFound.u_id,
          tipo_operacion: OperationType.Update,
          valores_anteriores: oldValues,
          valores_nuevos: finalUserUpdateDTO,
          realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
        };

        AuditManager.generalInsert(newActivity);

        const response: UpdateResponse<Usuario> = {
          message: 'Usuario actualizado exitosamente',
        };
        return res.status(200).json(response);
      }

      return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del usuario' });
    });
  }

  get listUsersOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const users = await this.user_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.user_repository.countTotal();

      const response: OffsetPaginationResponse<UserWithRoleAndPersonal> = {
        data: users,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: users.length,
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

      const { u_id } = req.params as { u_id: string };
      const userFound = await this.user_repository.findById(Number(u_id));
      if (userFound === undefined) {
        return res.status(400).json({ success: false, message: 'Usuario no disponible' });
      }
      await this.user_repository.softDelete(userFound.u_id);

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'usuario',
        id_registro: userFound.p_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: userFound.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);

      const response: DeleteReponse = {
        message: 'Usuario eliminado exitosamente',
        id: userFound.u_id,
      };
      res.status(200).json(response);
    });
  }

  get singleUser() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { u_id } = req.params as { u_id: string };
      const userFound = await this.user_repository.findWithRoleAndPersonalById(Number(u_id));
      if (userFound === undefined) {
        return res.status(400).json({ success: false, message: 'Usuario no disponible' });
      }
      const response: EntityResponse<UserWithRoleAndPersonal> = userFound;

      res.status(200).json(response);
    });
  }
}
