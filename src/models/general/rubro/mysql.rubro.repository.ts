import { RowDataPacket } from 'mysql2';
import { Rubro } from './rubro.entity';
import { RubroRepository } from './rubro.repository';
import { MySQL2 } from '../../../database/mysql';

interface RubroRowData extends RowDataPacket, Rubro {}

export class MySQLRubroRepository implements RubroRepository {
  async findAll(): Promise<Rubro[]> {
    const rubros = await MySQL2.executeQuery<RubroRowData[]>({ sql: `SELECT * FROM general.rubro ORDER BY r_id ASC` });
    return rubros;
  }
  async findById(r_id: number): Promise<Rubro | undefined> {
    const rubros = await MySQL2.executeQuery<RubroRowData[]>({ sql: `SELECT * FROM general.rubro WHERE r_id = ? LIMIT 1`, values: [r_id] });
    return rubros[0];
  }
}
