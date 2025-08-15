import { RowDataPacket } from 'mysql2';
import { Contrata } from '../../types/db';
import { MySQL2 } from '../../database/mysql';
import { genericLogger } from '../../services/loggers';
import { filterUndefined } from '../../utils/filterUndefined';

interface ContrataRowData extends RowDataPacket, Contrata {}

export class ContrataMapManager {
  static #contratas: Map<number, Contrata> = new Map();

  static add(co_id: number, newContrata: Contrata) {
    const existContrata = ContrataMapManager.#contratas.has(co_id);
    if (!existContrata) {
      ContrataMapManager.#contratas.set(co_id, newContrata);
      // notify add (newContrata)
    }
  }

  static update(co_id: number, fieldsUpdate: Partial<Contrata>) {
    const currContrata = ContrataMapManager.#contratas.get(co_id);
    if (currContrata !== undefined) {
      // const curContrataCopy = {...currContrata}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { co_id, ...fieldsFiltered } = filterUndefined<Contrata>(fieldsUpdate);
      Object.assign(currContrata, fieldsFiltered);
      // notify update (curContrataCopy,fieldsFiltered)
    }
  }

  static getContrata(co_id: number, activeOnly: boolean = true): Contrata | undefined {
    const contrata = ContrataMapManager.#contratas.get(co_id);
    if (!activeOnly) {
      return contrata;
    }

    if (contrata !== undefined && contrata.activo === 1) {
      return contrata;
    }
    return undefined;
  }

  static async init() {
    try {
      const initialContratas = await MySQL2.executeQuery<ContrataRowData[]>({ sql: `SELECT * FROM general.contrata WHERE activo = 1` });
      if (initialContratas.length > 0) {
        for (const contrata of initialContratas) {
          ContrataMapManager.add(contrata.co_id, contrata);
        }
      }
    } catch (error) {
      genericLogger.error(`ContrataMap | Error al inicilizar contratas`, error);
      throw error;
    }
  }
}
