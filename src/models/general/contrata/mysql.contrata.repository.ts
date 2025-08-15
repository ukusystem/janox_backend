import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { Contrata } from './contrata.entity';
import { ContrataRepository, ContrataWithRubro } from './contrata.repository';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';
import { PaginationContrata } from './schemas/pagination.contrata.schema';
import { Rubro } from '../rubro/rubro.entity';
interface TotalContrataRowData extends RowDataPacket {
  total: number;
}
interface ContrataRowData extends RowDataPacket, Contrata {}
interface ContrataRubroRowData extends RowDataPacket, Contrata, Rubro {
  total_personal: number;
}

interface FilterSintax {
  query: string;
  values: any[];
}

export class MySQLContrataRepository implements ContrataRepository {
  async create(data: CreateContrataDTO): Promise<Contrata> {
    const { contrata, r_id, descripcion } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.contrata ( contrata, r_id, descripcion , activo, created_at, updated_at) VALUES ( ? , ? , ? , 1, NOW(), NOW() )`, values: [contrata, r_id, descripcion] });

    const newContrata: Contrata = { contrata, r_id, descripcion, activo: 1, co_id: result.insertId };
    return newContrata;
  }

  async update(co_id: number, fieldsUpdate: UpdateContrataDTO): Promise<void> {
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

    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.contrata SET ${queryValues.setQuery} WHERE co_id = ? LIMIT 1`, values: [...queryValues.setValues, co_id] });
  }

  async softDelete(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.contrata SET activo = 0 WHERE activo = 1 AND co_id = ? LIMIT 1`, values: [co_id] });
  }

  private getRubroFilter(filters: PaginationContrata['filters'], alias?: string): FilterSintax | undefined {
    let rubroFilter: FilterSintax | undefined = undefined;

    if (filters !== undefined) {
      if (filters.rubros !== undefined) {
        const uniqueRubros = Array.from(new Set(filters.rubros));

        const rubroQuery = uniqueRubros.reduce<FilterSintax>(
          (prev, curr, index) => {
            const result = prev;
            result.query = result.query.trim() + ` ${alias !== undefined ? `${alias}.` : ''}r_id = ? ` + (index < uniqueRubros.length - 1 ? ' OR ' : ' ) ');
            result.values.push(curr);

            return result;
          },
          { query: ' ( ', values: [] },
        );
        rubroFilter = rubroQuery;
      }
    }
    return rubroFilter;
  }

  async findByOffsetPagination(limit: number, offset: number, filters?: PaginationContrata['filters']): Promise<ContrataWithRubro[]> {
    const rubroFilter = this.getRubroFilter(filters, 'r');
    const nombreFilter = filters?.nombre ? ` AND c.contrata LIKE ? ` : '';

    const contratas = await MySQL2.executeQuery<ContrataRubroRowData[]>({
      sql: ` SELECT  c.*,  r.rubro, COUNT(DISTINCT p.co_id) AS total_personal, COUNT(DISTINCT u.u_id) AS total_cuentas_activas, COUNT(DISTINCT a.a_id) AS total_tarjetas FROM  general.contrata c INNER JOIN  general.rubro r ON c.r_id = r.r_id AND c.activo = 1 ${rubroFilter !== undefined ? ` AND ${rubroFilter.query} ` : ''}   ${nombreFilter} LEFT JOIN  general.personal p ON p.co_id = c.co_id AND p.activo = 1 LEFT JOIN general.usuario u ON u.p_id = p.p_id AND u.activo = 1 LEFT JOIN general.acceso a ON a.p_id = p.p_id AND a.activo = 1  
 GROUP BY  c.co_id, r.r_id ORDER BY  c.co_id DESC LIMIT ? OFFSET ?`,
      values: [...(rubroFilter?.values || []), ...(filters?.nombre ? [`%${filters.nombre}%`] : []), limit, offset],
    });

    return contratas.map(({ contrata, descripcion, correo, activo, created_at, updated_at, co_id, r_id, rubro, total_personal, total_cuentas_activas, total_tarjetas }) => ({
      contrata,
      descripcion,
      correo,
      activo,
      created_at,
      updated_at,
      co_id,
      r_id,
      rubro: { r_id, rubro },
      total_personal,
      total_cuentas_activas,
      total_tarjetas,
    }));
  }

  async countTotal(filters?: PaginationContrata['filters']): Promise<number> {
    const rubroFilter = this.getRubroFilter(filters);
    const totals = await MySQL2.executeQuery<TotalContrataRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.contrata WHERE activo = 1 ${rubroFilter !== undefined ? ` AND ${rubroFilter.query} ` : ''}`, values: [...(rubroFilter?.values || [])] });
    return totals[0].total;
  }

  async findWithRubroById(co_id: number): Promise<ContrataWithRubro | undefined> {
    const contratas = await MySQL2.executeQuery<ContrataRubroRowData[]>({
      sql: ` SELECT  c.*,  r.rubro, COUNT(DISTINCT p.co_id) AS total_personal, COUNT(DISTINCT u.u_id) AS total_cuentas_activas, COUNT(DISTINCT a.a_id) AS total_tarjetas FROM  general.contrata c INNER JOIN  general.rubro r ON c.r_id = r.r_id AND c.activo = 1 AND c.co_id = ? LEFT JOIN  general.personal p ON p.co_id = c.co_id AND p.activo = 1 LEFT JOIN general.usuario u ON u.p_id = p.p_id AND u.activo = 1 LEFT JOIN general.acceso a ON a.p_id = p.p_id AND a.activo = 1 GROUP BY  c.co_id, r.r_id LIMIT 1`,
      values: [co_id],
    });
    if (contratas[0]) {
      const { contrata, descripcion, activo, co_id, r_id, rubro, total_personal, total_cuentas_activas, total_tarjetas } = contratas[0];
      return { contrata, descripcion, activo, co_id, r_id, rubro: { r_id, rubro }, total_personal, total_cuentas_activas, total_tarjetas };
    }
    return undefined;
  }
  async findById(co_id: number): Promise<Contrata | undefined> {
    const contratas = await MySQL2.executeQuery<ContrataRowData[]>({ sql: `SELECT * FROM general.contrata WHERE co_id = ? AND activo = 1 LIMIT 1`, values: [co_id] });
    return contratas[0];
  }
}
