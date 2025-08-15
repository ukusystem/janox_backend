import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { EquipoAcceso } from './equipo.acceso.entity';
import { EquipoAccesoRepository } from './equipo.acceso.repository';

interface EquipoAccesoRowData extends RowDataPacket, EquipoAcceso {}
export class MySQLEquipoAccesoRepository implements EquipoAccesoRepository {
  async findAll(): Promise<EquipoAcceso[]> {
    const equiposAcceso = await MySQL2.executeQuery<EquipoAccesoRowData[]>({ sql: `SELECT * FROM general.equipoacceso ORDER BY ea_id ASC` });
    return equiposAcceso;
  }
  async findById(ea_id: number): Promise<EquipoAcceso | undefined> {
    const equiposAcceso = await MySQL2.executeQuery<EquipoAccesoRowData[]>({ sql: `SELECT * FROM general.equipoacceso WHERE ea_id = ? LIMIT 1`, values: [ea_id] });
    return equiposAcceso[0];
  }
}
