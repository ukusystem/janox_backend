import { Rubro } from './rubro.entity';

export interface RubroRepository {
  findById(r_id: number): Promise<Rubro | undefined>;
  findAll(): Promise<Rubro[]>;
}
