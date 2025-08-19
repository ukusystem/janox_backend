import { Personal } from '../personal/personal.entity';
import { Acceso } from './Acceso';
import { CreateAccesoDTO } from './dtos/CreateAccesoDTO';
import { ImportAccesoDTO } from './dtos/ImportAccesoDTO';
import { UpdateAccesoDTO } from './dtos/UpdateAccesoDTO';

export interface AccesoWithPersonal extends Acceso {
  personal: Pick<Personal, 'nombre' | 'apellido' | 'foto' | 'telefono'>;
  contrata: string;
  tipo: string;
}

export interface AccesoRepository {
  findById(a_id: number): Promise<Acceso | undefined>;
  findBySerie(serie: number): Promise<Acceso | undefined>;
  findByContrataId(co_id: number): Promise<Array<Acceso>>;
  findMembersByContrataId(co_id: number): Promise<Array<Acceso>>;
  findByPersonalId(p_id: number): Promise<Array<Acceso>>;
  create(data: CreateAccesoDTO): Promise<Acceso>;
  update(a_id: number, fieldsUpdate: UpdateAccesoDTO): Promise<void>;
  softDelete(a_id: number): Promise<void>;
  softDeleteByContrataId(co_id: number): Promise<void>;
  softDeleteMembersByContrataId(co_id: number): Promise<void>;
  softDeleteByPersonalId(p_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number): Promise<Acceso[]>;
  findWithPersonalByOffsetPagination(limit: number, offset: number, serie?: string): Promise<AccesoWithPersonal[]>;
  countTotal(filters?: any): Promise<number>;
  findInactive(): Promise<number>;
  getAllAccessToJson(): Promise<Acceso[]>;
  deleteAllAccess(): Promise<void>;
  insertAccessBulk(data: ImportAccesoDTO[]): Promise<void>;
  findTipoAccesoByIds(ids: number[]): Promise<number[]>;
  findPersonalByIds(ids: number[]): Promise<number[]>;
}
