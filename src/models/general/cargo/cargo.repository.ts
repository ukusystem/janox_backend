import { Cargo } from './cargo.entity';

export interface CargoRepository {
  findById(c_id: number): Promise<Cargo | undefined>;
  findAll(): Promise<Cargo[]>;
}
