import { EquipoAcceso } from './equipo.acceso.entity';

export interface EquipoAccesoRepository {
  findById(ea_id: number): Promise<EquipoAcceso | undefined>;
  findAll(): Promise<EquipoAcceso[]>;
}
