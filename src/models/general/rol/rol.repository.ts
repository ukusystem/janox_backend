import { Rol } from './rol.entinty';

export interface RolRepository {
  findById(rl_id: number): Promise<Rol | undefined>;
  findAll(): Promise<Rol[]>;
}
