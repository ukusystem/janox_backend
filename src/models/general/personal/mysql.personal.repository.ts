import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { Personal, PersonalWithOcupation, SinglePersonal } from './personal.entity';
import { PersonalRepository } from './personal.repository';
import { CreatePersonalDTO } from './dtos/create.personal.dto';
import { UpdatePersonalDTO } from './dtos/update.personal.dto';
interface PersonalRowData extends RowDataPacket, Personal {}
interface PersonalWithOcupationRowData extends RowDataPacket, PersonalWithOcupation {}

interface SinglePersonalRowData extends RowDataPacket, SinglePersonal {}

interface TotalPersonalRowData extends RowDataPacket {
  total: number;
}

export class MySQLPersonalRespository implements PersonalRepository {
  async countTotalMembersByCotrataId(co_id: number): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalPersonalRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.personal WHERE activo = 1 AND representante = 0 AND co_id = ? `, values: [co_id] });
    return totals[0].total;
  }
  async findMembersByContrataId(co_id: number, name?: string): Promise<PersonalWithOcupation[]> {
    const nombreFilter = name ? ` AND p.nombre LIKE ?` : '';

    const sql = `
      SELECT p.*, 
      c.cargo,
             COUNT(a.a_id) AS cantidad_tarjetas, 
             COUNT(u.u_id) AS cantidad_cuentas  
      FROM general.personal p 
      INNER JOIN general.cargo c ON p.c_id = c.c_id
      LEFT JOIN general.acceso a ON p.p_id = a.p_id AND a.activo = 1 
      LEFT JOIN general.usuario u ON p.p_id = u.p_id AND u.activo = 1 
      WHERE p.activo = 1 AND co_id = ?${nombreFilter} 
      GROUP BY p.p_id`;

    const values: (number | string)[] = [co_id];
    if (name) values.push(`%${name}%`);

    const listPersonal = await MySQL2.executeQuery<PersonalWithOcupationRowData[]>({ sql, values });
    return listPersonal;
  }

  async softDeleteMembersByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET activo = 0 WHERE activo = 1 AND representante = 0 AND co_id = ?`, values: [co_id] });
  }

  async isAvailableRepresentante(co_id: number): Promise<boolean> {
    const personales = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE co_id = ? AND representante = 1 AND activo = 1 LIMIT 1`, values: [co_id] });
    return personales.length === 0;
  }

  async findByCoUuIdAndOffsetPagination(co_uuid: string, limit: number, offset: number): Promise<Personal[]> {
    const personales = await MySQL2.executeQuery<PersonalRowData[]>({
      sql: `SELECT p.* , c.co_uuid FROM general.personal p INNER JOIN general.contrata c ON p.co_id = c.co_id WHERE p.activo = 1 AND p.representante = 0 AND c.co_uuid = ?  ORDER BY p.p_id ASC LIMIT ? OFFSET ?`,
      values: [co_uuid, limit, offset],
    });
    return personales;
  }

  async findByContrataId(co_id: number): Promise<Personal[]> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE activo = 1 AND co_id = ? `, values: [co_id] });
    return listPersonal;
  }

  async softDeleteByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET activo = 0 WHERE activo = 1 AND co_id = ?`, values: [co_id] });
  }

  async countTotalByCotrataId(co_id: number): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalPersonalRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.personal WHERE activo = 1 AND co_id = ? `, values: [co_id] });
    return totals[0].total;
  }
  async findByDni(dni: string): Promise<Personal | undefined> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE dni = ? AND activo = 1 LIMIT 1`, values: [dni] });
    return listPersonal[0];
  }
  async create(data: CreatePersonalDTO): Promise<Personal> {
    const { nombre, apellido, telefono, dni, co_id, foto, correo, c_id } = data;

    const result = await MySQL2.executeQuery<ResultSetHeader>({
      sql: `INSERT INTO general.personal ( nombre, apellido, telefono, dni, co_id, foto, correo, c_id , activo ) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , 1 )`,
      values: [nombre, apellido, telefono, dni, co_id, foto, correo, c_id],
    });
    return { nombre, apellido, telefono, dni, co_id, foto, correo, c_id: 1, activo: 1, p_id: result.insertId };
  }

  async update(p_id: number, fieldsUpdate: UpdatePersonalDTO): Promise<void> {
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

    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET ${queryValues.setQuery} WHERE p_id = ? LIMIT 1`, values: [...queryValues.setValues, p_id] });
  }

  async softDelete(p_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET activo = 0 WHERE activo = 1 AND p_id = ? LIMIT 1`, values: [p_id] });
  }

  async findByOffsetPagination(limit: number, offset: number, name?: string): Promise<Personal[]> {
    const hasName = Boolean(name);

    const nombreFilter = hasName ? ` AND nombre LIKE ?` : '';

    const sql = `
      SELECT * FROM general.personal 
      WHERE activo = 1
      ${nombreFilter}
      ORDER BY p_id ASC 
      LIMIT ? OFFSET ?
    `;

    const values = hasName ? [`%${name}%`, limit, offset] : [limit, offset];

    const personales = await MySQL2.executeQuery<PersonalRowData[]>({
      sql,
      values,
    });

    return personales;
  }

  async countTotal(_filters?: any): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalPersonalRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.personal WHERE activo = 1` });
    return totals[0].total;
  }

  async findById(p_id: number): Promise<Personal | undefined> {
    const listPersonal = await MySQL2.executeQuery<SinglePersonalRowData[]>({
      sql: `   SELECT 
        p.*,
        c.cargo AS cargo_nombre,
        u.u_id AS u_id,
        u.usuario AS usuario,
         COUNT(a.a_id) AS cantidad_tarjetas, 
             COUNT(u.u_id) AS cantidad_cuentas  
      FROM 
        general.personal p
      INNER JOIN 
        general.cargo c ON p.c_id = c.c_id
              LEFT JOIN general.acceso a ON p.p_id = a.p_id AND a.activo = 1 
      LEFT JOIN general.usuario u ON p.p_id = u.p_id AND u.activo = 1 
      WHERE 
        p.p_id = ? AND p.activo = 1
      GROUP BY 
      p.p_id, c.cargo, u.u_id, u.usuario
      LIMIT 1`,
      values: [p_id],
    });
    return listPersonal[0];
  }
}
