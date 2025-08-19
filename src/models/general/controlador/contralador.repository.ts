import { Controlador } from '../../../types/db';

export type ControladorRegion = Controlador & {
  region: string;
  region_descripcion: string;
};

export interface ControladorRepository {
  findById(ctrl_id: number): Promise<ControladorRegion | undefined>;
  searchALl(): Promise<Array<ControladorRegion>>;
}
