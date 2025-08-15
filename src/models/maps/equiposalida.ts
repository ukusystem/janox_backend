import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { EquipoSalida } from '../../types/db';
import { filterUndefined } from '../../utils/filterUndefined';
import { genericLogger } from '../../services/loggers';

interface EquipoSalidaRowData extends RowDataPacket, EquipoSalida {}

export class EquipoSalidaMapManager {
  static #equipos: Map<number, EquipoSalida> = new Map();

  static add(newEqSal: EquipoSalida) {
    const hasEqSal = EquipoSalidaMapManager.#equipos.has(newEqSal.es_id);
    if (!hasEqSal) {
      EquipoSalidaMapManager.#equipos.set(newEqSal.es_id, newEqSal);
      // notify add (newEqSal)
    }
  }

  static update(es_id: number, fieldsUpdate: Partial<EquipoSalida>) {
    const curEqSal = EquipoSalidaMapManager.#equipos.get(es_id);
    if (curEqSal !== undefined) {
      // const curEqSalCopy = {...curEqSal}

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { es_id, ...fieldsFiltered } = filterUndefined<EquipoSalida>(fieldsUpdate);
      Object.assign(curEqSal, fieldsFiltered);
      // notify update (curEqSalCopy,fieldsFiltered)
    }
  }

  static delete(es_id: number): boolean {
    return EquipoSalidaMapManager.#equipos.delete(es_id);
  }

  static getEquipoSalida(es_id: number, onlyActive: boolean = true): EquipoSalida | undefined {
    const equiSal = EquipoSalidaMapManager.#equipos.get(es_id);
    if (!onlyActive) {
      return equiSal;
    }

    if (equiSal !== undefined && equiSal.activo === 1) {
      return equiSal;
    }
    return undefined;
  }

  static async init() {
    try {
      const equiposSal = await MySQL2.executeQuery<EquipoSalidaRowData[]>({ sql: `SELECT * FROM general.equiposalida WHERE activo = 1` });
      if (equiposSal.length > 0) {
        for (const equipo of equiposSal) {
          EquipoSalidaMapManager.add(equipo);
        }
      }
    } catch (error) {
      genericLogger.error(`EquipoSalidaMapManager | Error al inicializar equipos salida`, error);
      throw error;
    }
  }
}
