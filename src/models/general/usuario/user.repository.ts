import { CreateUserDTO } from './dtos/create.user.dto';
import { UpdateUserDTO } from './dtos/update.user.dto';
import { Usuario } from './user.entity';

export interface UserWithRoleAndPersonal extends Omit<Usuario, 'contraseña'> {
  rol: {
    rl_id: number;
    rol: string;
  };
  personal: {
    p_id: number;
    nombre: string;
    apellido: string;
  };
}

export interface UserRepository {
  create(data: CreateUserDTO): Promise<Usuario>;
  findById(u_id: number): Promise<Usuario | undefined>;
  // findByUuId(u_uuid: string): Promise<Usuario | undefined>;
  findByContrataId(co_id: number): Promise<Array<Usuario>>;
  findMembersByContrataId(co_id: number): Promise<Array<Usuario>>;
  findByPersonalId(p_id: number): Promise<Array<Usuario>>;
  // findWithRoleByPersonalUuId(p_uuid: string): Promise<UserWithRoleAndPersonal | undefined>;
  findWithRoleAndPersonalById(u_id: number): Promise<UserWithRoleAndPersonal | undefined>;
  // findWithRoleAndPersonalByUuId(u_uuid: string): Promise<UserWithRoleAndPersonal | undefined>;
  update(u_id: number, fieldsUpdate: UpdateUserDTO): Promise<void>;
  findAll(): Promise<Usuario[]>;
  isUsernameAvailable(username: string): Promise<boolean>;
  isPersonalAvailable(p_id: number): Promise<boolean>;
  softDelete(u_id: number): Promise<void>;
  softDeleteByContrataId(co_id: number): Promise<void>;
  softDeleteMembersByContrataId(co_id: number): Promise<void>;
  softDeleteByPersonalId(p_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number): Promise<UserWithRoleAndPersonal[]>;

  countTotal(filters?: any): Promise<number>;
}
