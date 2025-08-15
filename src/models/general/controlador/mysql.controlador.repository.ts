import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { ControladorRegion, ControladorRepository } from './contralador.repository';

interface ControladorRegionRowData extends RowDataPacket, ControladorRegion {}

export class MySQLContraldorRepository implements ControladorRepository {
  async findById(ctrl_id: number): Promise<ControladorRegion | undefined> {
    const controladores = await MySQL2.executeQuery<ControladorRegionRowData[]>({ sql: `SELECT c.* , r.region , r.descripcion AS region_descripcion FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo = 1 AND c.ctrl_id = ?`, values: [ctrl_id] });
    return controladores[0];
  }
  async searchALl(): Promise<Array<ControladorRegion>> {
    const controladores = await MySQL2.executeQuery<ControladorRegionRowData[]>({ sql: `SELECT c.* , r.region , r.descripcion AS region_descripcion FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo = 1` });
    return controladores;
  }
}
