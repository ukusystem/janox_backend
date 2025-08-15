import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { EquipoEntrada } from '../../types/db';
import { filterUndefined } from '../../utils/filterUndefined';
import { genericLogger } from '../../services/loggers';

interface EquipoEntradaRowData extends RowDataPacket, EquipoEntrada {}

export class EquipoEntradaMapManager {
  static #equipos: Map<number, EquipoEntrada> = new Map();

  static add(newEqEnt: EquipoEntrada) {
    const existEqEnt = EquipoEntradaMapManager.#equipos.has(newEqEnt.ee_id);
    if (!existEqEnt) {
      EquipoEntradaMapManager.#equipos.set(newEqEnt.ee_id, newEqEnt);
      // notify add (newEqEnt)
    }
  }

  static update(ee_id: number, fieldsUpdate: Partial<EquipoEntrada>) {
    const currEqEnt = EquipoEntradaMapManager.#equipos.get(ee_id);
    if (currEqEnt !== undefined) {
      // const currEqEntCopy = {...currEqEnt}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ee_id, ...fieldsFiltered } = filterUndefined<EquipoEntrada>(fieldsUpdate);
      Object.assign(currEqEnt, fieldsFiltered);
      // notify update (currEqEntCopy,fieldsFiltered)
    }
  }

  static delete(ee_id: number): boolean {
    return EquipoEntradaMapManager.#equipos.delete(ee_id);
  }

  static getEquipoEntrada(ee_id: number, onlyActive: boolean = true): EquipoEntrada | undefined {
    const equipoEntrada = EquipoEntradaMapManager.#equipos.get(ee_id);
    if (!onlyActive) {
      return equipoEntrada;
    }

    if (equipoEntrada !== undefined && equipoEntrada.activo === 1) {
      return equipoEntrada;
    }
    return undefined;
  }

  static async init() {
    try {
      const equipos = await MySQL2.executeQuery<EquipoEntradaRowData[]>({ sql: `SELECT * FROM general.equipoentrada WHERE activo = 1` });
      if (equipos.length > 0) {
        for (const equipo of equipos) {
          EquipoEntradaMapManager.add(equipo);
        }
      }
    } catch (error) {
      genericLogger.error(`EquipoEntradaMapManager | Error al inicializar equipos`, error);
      throw error;
    }
  }
}
