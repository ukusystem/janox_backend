import { MySQL2 } from '../../database/mysql';
import { handleErrorWithArgument } from '../../utils/simpleErrorHandler';

import { RowDataPacket } from 'mysql2';
import dayjs from 'dayjs';

type RegistroTemperaturaInfo = { temperatura: number; hora_min: number };
interface RegistroTemperaturaRowData extends RowDataPacket, RegistroTemperaturaInfo {}

export class Temperatura {
  static #NUM_PARTITION: number = 50;

  static getRegistroTempByDay = handleErrorWithArgument<RegistroTemperaturaInfo[], { ctrl_id: number; st_id: number; date: string }>(async ({ ctrl_id, st_id, date }) => {
    const newDate = dayjs(date, 'YYYY-MM-DD');
    const partitioning = `PARTITION (p${newDate.year() % Temperatura.#NUM_PARTITION})`;
    const registrosTempData = await MySQL2.executeQuery<RegistroTemperaturaRowData[]>({
      sql: `SELECT fecha AS x , valor AS y from ${'nodo' + ctrl_id}.registrotemperatura ${partitioning} WHERE st_id = ? AND fecha BETWEEN '${newDate.startOf('day').format('YYYY-MM-DD HH:mm:ss')}' AND '${newDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')}' ORDER BY rtmp_id ASC`,
      values: [st_id, date],
    });

    if (registrosTempData.length > 0) {
      return registrosTempData;
    }
    return [];
  }, 'Temperatura.getRegistroTempByDay');
}
