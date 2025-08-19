import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { Region } from '../../types/db';
import { RegionNotifyManager } from '../system';
import { genericLogger } from '../../services/loggers';

interface RegionRowData extends RowDataPacket, Region {}

export class RegionMapManager {
  static #regions: Map<number, Region> = new Map();

  static #filterUndefined(data: Partial<Region>): Partial<Region> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof Region;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(rgn_id: number, newRegion: Region) {
    const existRegion = RegionMapManager.#regions.has(rgn_id);
    if (!existRegion) {
      RegionMapManager.#regions.set(rgn_id, newRegion);
      RegionNotifyManager.add(newRegion);
    }
  }

  static update(rgn_id: number, fieldsUpdate: Partial<Region>) {
    const currRegion = RegionMapManager.#regions.get(rgn_id);
    if (currRegion !== undefined) {
      const curRegionCopy = { ...currRegion };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rgn_id, ...fieldsFiltered } = RegionMapManager.#filterUndefined(fieldsUpdate);
      Object.assign(currRegion, fieldsFiltered);
      RegionNotifyManager.update(curRegionCopy, fieldsFiltered);
    }
  }

  static getRegion(rgn_id: number): Region | undefined {
    return RegionMapManager.#regions.get(rgn_id);
  }

  static getAllRegion(): Region[] {
    return Array.from(RegionMapManager.#regions.values());
  }

  static async init() {
    try {
      const regions = await MySQL2.executeQuery<RegionRowData[]>({
        sql: `SELECT * FROM general.region`,
      });
      regions.forEach((region) => {
        RegionMapManager.add(region.rgn_id, region);
      });
    } catch (error) {
      genericLogger.error(`RegionMapManager | Error al inicializar regiones`, error);
      throw error;
    }
  }
}

// (async () => {
//   setInterval(() => {
//     console.log("============Update Region==========")
//     const getRandomNumber = (min: number, max: number): number  => {
//       return Math.floor(Math.random() * (max - min + 1)) + min;
//     }
//     RegionMapManager.update(1,{region: `Ancash ${getRandomNumber(10,20)}`})
//   }, 10000);
// })();
