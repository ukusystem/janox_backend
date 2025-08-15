import { CreatePersonalDTO } from './dtos/create.personal.dto';
import { UpdatePersonalDTO } from './dtos/update.personal.dto';
import { Personal, PersonalWithOcupation } from './personal.entity';

export interface PersonalRepository {
  findById(p_id: number): Promise<Personal | undefined>;
  // findByUuId(p_uuid: string): Promise<Personal | undefined>;
  findByDni(dni: string): Promise<Personal | undefined>;
  findByContrataId(co_id: number): Promise<Personal[]>;
  findMembersByContrataId(co_id: number, name?: string): Promise<PersonalWithOcupation[]>;
  create(data: CreatePersonalDTO, isRepresentante?: boolean): Promise<Personal>;
  update(p_id: number, fieldsUpdate: UpdatePersonalDTO): Promise<void>;
  softDelete(p_id: number): Promise<void>;
  softDeleteByContrataId(co_id: number): Promise<void>;
  softDeleteMembersByContrataId(co_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number, name?: string): Promise<Personal[]>;
  // findByCoUuIdAndOffsetPagination(co_uuid: string, limit: number, offset: number): Promise<Personal[]>;
  countTotal(filters?: any): Promise<number>;
  countTotalByCotrataId(co_id: number): Promise<number>;
  countTotalMembersByCotrataId(co_id: number): Promise<number>;
  // countTotalByCotrataUuId(co_uuid: string): Promise<number>;

  isAvailableRepresentante(co_id: number): Promise<boolean>;
  // findRepresentanteByCoUuId(co_uuid: string): Promise<Personal | undefined>;
}
