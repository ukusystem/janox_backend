import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { Personal } from '../../types/db';
import { filterUndefined } from '../../utils/filterUndefined';
import { genericLogger } from '../../services/loggers';

interface PersonalRowData extends RowDataPacket, Personal {}

export class PersonalMapManager {
  static #personales: Map<number, Personal> = new Map();

  static add(newPersonal: Personal) {
    const existPersonal = PersonalMapManager.#personales.has(newPersonal.p_id);
    if (!existPersonal) {
      PersonalMapManager.#personales.set(newPersonal.p_id, newPersonal);
      // notify add (newPersonal)
    }
  }

  static update(p_id: number, fieldsUpdate: Partial<Personal>) {
    const curPersonal = PersonalMapManager.#personales.get(p_id);
    if (curPersonal !== undefined) {
      // const curPersonalCopy = {...curPersonal}

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { p_id, ...fieldsFiltered } = filterUndefined<Personal>(fieldsUpdate);
      Object.assign(curPersonal, fieldsFiltered);
      // notify update (curPersonalCopy,fieldsFiltered)
    }
  }

  static delete(p_id: number): boolean {
    return PersonalMapManager.#personales.delete(p_id);
  }

  static getPersonal(p_id: number, onlyActive: boolean = true): Personal | undefined {
    const personal = PersonalMapManager.#personales.get(p_id);
    if (!onlyActive) {
      return personal;
    }

    if (personal !== undefined && personal.activo === 1) {
      return personal;
    }
    return undefined;
  }

  static async init() {
    try {
      const personales = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE activo = 1` });
      if (personales.length > 0) {
        for (const personal of personales) {
          PersonalMapManager.add(personal);
        }
      }
    } catch (error) {
      genericLogger.error(`PersonalMapManager | Error al inicializar personales`, error);
      throw error;
    }
  }
}
