import { ResultSetHeader, RowDataPacket } from 'mysql2';

import { MySQL2 } from '../../../database/mysql';
import { Acceso } from './Acceso';
import { AccesoRepository, AccesoWithPersonal } from './AccesoRepository';
import { CreateAccesoDTO } from './dtos/CreateAccesoDTO';
import { UpdateAccesoDTO } from './dtos/UpdateAccesoDTO';
import { Personal } from '../personal/personal.entity';
import { ImportAccesoDTO } from './dtos/ImportAccesoDTO';

interface AccesoRowData extends RowDataPacket, Acceso {}
interface AccesoPersonalRowData extends RowDataPacket, Acceso, Pick<Personal, 'nombre' | 'apellido' | 'foto' | 'telefono'> {
  contrata: string;
  tipo: string;
}
interface TotalAccespRowData extends RowDataPacket {
  total: number;
}
interface InactiveAccessRowData extends RowDataPacket {
  total: number;
}
export class MySQLAccesoRepository implements AccesoRepository {
  async findWithPersonalByOffsetPagination(limit: number, offset: number, serie?: string): Promise<AccesoWithPersonal[]> {
    const serieFilter = serie !== undefined ? ` AND a.serie LIKE ? ` : '';
    const accesos = await MySQL2.executeQuery<AccesoPersonalRowData[]>({
      sql: `
      SELECT a.*, p.nombre AS nombre_personal, p.apellido, p.foto, p.telefono, c.contrata, e.nombre AS tipo
      FROM general.acceso a 
      INNER JOIN general.personal p ON a.p_id = p.p_id 
      INNER JOIN general.contrata c ON p.co_id = c.co_id 
      INNER JOIN general.equipoacceso e ON a.ea_id = e.ea_id 
      WHERE a.activo = 1 
       ${serieFilter}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
      `,
      values: [...(serie !== undefined ? [`%${serie}%`] : []), limit, offset],
    });
    return accesos.map<AccesoWithPersonal>(({ a_id, serie, administrador, p_id, ea_id, activo, nombre_personal, apellido, foto, telefono, contrata, tipo }) => ({ a_id, serie, administrador, p_id, ea_id, activo, personal: { nombre: nombre_personal, apellido, foto, telefono }, contrata, tipo }));
  }
  async findMembersByContrataId(co_id: number): Promise<Array<Acceso>> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT a.* FROM general.acceso a INNER JOIN general.personal p  ON a.p_id = p.p_id AND a.activo = 1 AND p.representante = 0 AND p.co_id = ?`, values: [co_id] });
    return accesos;
  }
  async softDeleteMembersByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso a INNER JOIN general.personal p  ON a.p_id = p.p_id AND a.activo = 1 AND p.representante = 0  AND  p.co_id = ? SET a.activo = 0`, values: [co_id] });
  }
  async softDeleteByPersonalId(p_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET activo = 0 WHERE activo = 1 AND p_id = ?`, values: [p_id] });
  }
  async findByPersonalId(p_id: number): Promise<Array<Acceso>> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE activo = 1 AND p_id = ?  `, values: [p_id] });
    return accesos;
  }
  async findByContrataId(co_id: number): Promise<Array<Acceso>> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT a.* FROM general.acceso a INNER JOIN general.personal p  ON a.p_id = p.p_id AND a.activo = 1 AND p.co_id = ?`, values: [co_id] });
    return accesos;
  }
  async softDeleteByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso a INNER JOIN general.personal p  ON a.p_id = p.p_id AND a.activo = 1 AND p.co_id = ? SET a.activo = 0`, values: [co_id] });
  }
  async findBySerie(serie: number): Promise<Acceso | undefined> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE serie = ? AND activo = 1 LIMIT 1`, values: [serie] });
    return accesos[0];
  }

  async findById(a_id: number): Promise<Acceso | undefined> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({
      sql: `SELECT a.*,p.nombre AS nombre_personal, p.apellido, p.p_id FROM general.acceso a 
      INNER JOIN general.personal p ON a.p_id = p.p_id  WHERE a_id = ? AND a.activo = 1 LIMIT 1`,
      values: [a_id],
    });
    return accesos[0];
  }

  async create(data: CreateAccesoDTO): Promise<Acceso> {
    const { serie, administrador, p_id, ea_id } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.acceso ( serie, administrador, p_id, ea_id , activo ) VALUES ( ? , ? , ? , ? , 1 )`, values: [serie, administrador, p_id, ea_id] });
    return { serie, administrador, p_id, ea_id, activo: 1, a_id: result.insertId };
  }

  async update(a_id: number, fieldsUpdate: UpdateAccesoDTO): Promise<void> {
    const keyValueList = Object.entries(fieldsUpdate).filter(([, value]) => value !== undefined);
    const queryValues = keyValueList.reduce<{ setQuery: string; setValues: string[] }>(
      (prev, cur, index, arr) => {
        const result = prev;
        const [key, value] = cur;
        result.setQuery = `${result.setQuery.trim()} ${key} = ? ${index < arr.length - 1 ? ', ' : ''}`;
        result.setValues.push(value);
        return result;
      },
      { setQuery: '', setValues: [] },
    );
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET ${queryValues.setQuery} WHERE a_id = ? LIMIT 1`, values: [...queryValues.setValues, a_id] });
  }

  async softDelete(a_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET activo = 0 WHERE a_id = ? LIMIT 1`, values: [a_id] });
  }

  async findByOffsetPagination(limit: number, offset: number): Promise<Acceso[]> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE activo = 1 ORDER BY a_id ASC LIMIT ? OFFSET ?`, values: [limit, offset] });
    return accesos;
  }

  async countTotal(_filters?: any): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalAccespRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.acceso WHERE activo = 1` });
    return totals[0].total;
  }
  async findInactive(): Promise<number> {
    const totals = await MySQL2.executeQuery<InactiveAccessRowData[]>({
      sql: `SELECT a_id AS inactive FROM acceso WHERE activo = 0 ORDER BY a_id ASC LIMIT 1`,
    });
    return totals[0].inactive;
  }
  async getAllAccessToJson(): Promise<Acceso[]> {
    const results = await MySQL2.executeQuery<AccesoRowData[]>({
      sql: `
        SELECT 
          *
        FROM general.acceso
      `,
    });

    return results;
  }
  async deleteAllAccess(): Promise<void> {
    await MySQL2.executeQuery({ sql: 'DELETE FROM acceso' });
  }

  async insertAccessBulk(data: ImportAccesoDTO[]): Promise<void> {
    const now = new Date();
    const values = data.map((d) => [d.serie, d.administrador, d.ea_id, d.p_id, d.activo, now, now]);
    await MySQL2.executeQuery({
      sql: 'INSERT INTO acceso (serie, administrador, ea_id, p_id, activo, created_at, updated_at) VALUES ?',
      values: [values],
    });
  }

  async findTipoAccesoByIds(ids: number[]): Promise<number[]> {
    const result = await MySQL2.executeQuery<any[]>({
      sql: 'SELECT ea_id FROM general.equipoacceso WHERE ea_id IN (?)',
      values: [ids],
    });
    return result.map((r) => r.ea_id);
  }

  async findPersonalByIds(ids: number[]): Promise<number[]> {
    const result = await MySQL2.executeQuery<any[]>({
      sql: 'SELECT p_id FROM general.personal WHERE p_id IN (?)',
      values: [ids],
    });
    return result.map((r) => r.p_id);
  }
}
