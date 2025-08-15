import { RowDataPacket } from 'mysql2';
import { Rol } from './rol.entinty';
import { RolRepository } from './rol.repository';
import { MySQL2 } from '../../../database/mysql';

interface RolRowData extends RowDataPacket, Rol {}

export class MySQLRolRepository implements RolRepository {
  async findAll(): Promise<Rol[]> {
    const roles = await MySQL2.executeQuery<RolRowData[]>({ sql: `SELECT * FROM general.rol WHERE activo = 1 ORDER BY rl_id ASC` });
    return roles;
  }
  async findById(rl_id: number): Promise<Rol | undefined> {
    const roles = await MySQL2.executeQuery<RolRowData[]>({ sql: `SELECT * FROM general.rol WHERE rl_id = ? AND activo = 1 LIMIT 1`, values: [rl_id] });
    return roles[0];
  }
}
