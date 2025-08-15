import { RowDataPacket } from "mysql2";
import { TipoCamara } from "../../types/db";
import { MySQL2 } from "../../database/mysql";
import { genericLogger } from "../../services/loggers";

interface TipoCamaraRowData extends RowDataPacket, TipoCamara {}

export class TipoCamaraMapManager {
  static #resolutions: Map<number, TipoCamara> = new Map();

  static #filterUndefined(data: Partial<TipoCamara>): Partial<TipoCamara> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof TipoCamara;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(tc_id: number, newTipCam: TipoCamara) {
    const existTipCam = TipoCamaraMapManager.#resolutions.has(tc_id);
    if (!existTipCam) {
      TipoCamaraMapManager.#resolutions.set(tc_id, newTipCam);
    }
  }

  static update(tc_id: number, fieldsUpdate: Partial<TipoCamara>) {
    const currTipCam = TipoCamaraMapManager.#resolutions.get(tc_id);
    if (currTipCam !== undefined) {
      const fieldsFiltered = TipoCamaraMapManager.#filterUndefined(fieldsUpdate);
      Object.assign(currTipCam, fieldsFiltered);
    }
  }

  static getTipoCamara(tc_id: number): TipoCamara | undefined {
    return TipoCamaraMapManager.#resolutions.get(tc_id);
  }

  static async init() {
    try {
      const tiposcamara = await MySQL2.executeQuery<TipoCamaraRowData[]>({
        sql: `SELECT * FROM general.tipocamara`,
      });

      tiposcamara.forEach((tipocam) => {
        TipoCamaraMapManager.add(tipocam.tc_id, tipocam);
      });
    } catch (error) {
      genericLogger.error(`TipoCamaraMapManager | Error al inicializar tipo camaras`,error);
      throw error;
    }
  }
}