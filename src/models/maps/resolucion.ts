import { RowDataPacket } from 'mysql2';
import { Resolucion } from '../../types/db';
import { MySQL2 } from '../../database/mysql';
import { genericLogger } from '../../services/loggers';

interface ResolucionRowData extends RowDataPacket, Resolucion {}

export class ResolutionMapManager {
  static #resolutions: Map<number, Resolucion> = new Map();

  static #filterUndefined(data: Partial<Resolucion>): Partial<Resolucion> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof Resolucion;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(res_id: number, newRegion: Resolucion) {
    const existResolution = ResolutionMapManager.#resolutions.has(res_id);
    if (!existResolution) {
      ResolutionMapManager.#resolutions.set(res_id, newRegion);
    }
  }

  static update(res_id: number, fieldsUpdate: Partial<Resolucion>) {
    const currResolution = ResolutionMapManager.#resolutions.get(res_id);
    if (currResolution !== undefined) {
      const fieldsFiltered = ResolutionMapManager.#filterUndefined(fieldsUpdate);
      Object.assign(currResolution, fieldsFiltered);
    }
  }

  static getResolution(res_id: number): Resolucion | undefined {
    return ResolutionMapManager.#resolutions.get(res_id);
  }

  static async init() {
    try {
      const resolutions = await MySQL2.executeQuery<ResolucionRowData[]>({
        sql: `SELECT * FROM general.resolucion`,
      });

      resolutions.forEach((resolution) => {
        ResolutionMapManager.add(resolution.res_id, resolution);
      });
    } catch (error) {
      genericLogger.error(`Resolution | Error al inicializar regiones`, error);
      throw error;
    }
  }
}
