import { MySQL2 } from '../database/mysql';
import { handleErrorWithArgument } from '../utils/simpleErrorHandler';
export type Stream = {
  ctrl_id: number;
  cmr_id: number;
  descripcion: string;
  tc_id: number;
};

export type ConfigData = {
  gridOption: 1 | 2 | 3 | 'c3' | 'c4';
  streams: ({ ctrl_id: number; cmr_id: number } | null)[];
};
export type ConfigDataFinal = {
  gridOption: 1 | 2 | 3 | 'c3' | 'c4';
  streams: (Stream | null)[];
};

import type { PreferenciasVms } from '../types/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CustomError } from '../utils/CustomError';

interface PreferenciasVmsRowData extends RowDataPacket, PreferenciasVms {}

export class Vms {
  static getPreferencias = handleErrorWithArgument<PreferenciasVms[], { u_id: number }>(async ({ u_id }) => {
    const preferencias = await MySQL2.executeQuery<PreferenciasVmsRowData[]>({ sql: `SELECT * FROM general.preferenciasvms WHERE u_id = ? AND activo = 1`, values: [u_id] });

    if (preferencias.length > 0) {
      return preferencias;
    }

    return [];
  }, 'Vms.getPreferencias');

  static createPreferencia = handleErrorWithArgument<void, { preferencia: string; u_id: number; configdata: ConfigData }>(async ({ preferencia, u_id, configdata }) => {
    await MySQL2.executeQuery({ sql: `INSERT INTO general.preferenciasvms (preferencia,u_id,configdata,activo) VALUES ( ? , ? , ?, 1 )`, values: [preferencia, u_id, JSON.stringify(configdata)] });
    return;
  }, 'Vms.createPreferencia');

  static updatePreferencia = handleErrorWithArgument<void, { preferencia: string; configdata: ConfigData; prfvms_id: number; u_id: number }>(async ({ prfvms_id, preferencia, configdata, u_id }) => {
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.preferenciasvms SET preferencia = ? , configdata = ? WHERE prfvms_id = ? AND u_id = ? AND activo = 1 `, values: [preferencia, JSON.stringify(configdata), prfvms_id, u_id] });

    if (result.affectedRows === 0) {
      const errPrefId = new CustomError('No se ha encontrado ninguna preferencia de VMS con ese ID.', 400, 'Preferencia ID invalido');
      throw errPrefId;
    }
    return;
  }, 'Vms.updatePreferencia');

  static deletePreferencia = handleErrorWithArgument<void, { prfvms_id: number; u_id: number }>(async ({ prfvms_id, u_id }) => {
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.preferenciasvms SET activo = 0 WHERE prfvms_id = ? AND u_id = ? AND activo = 1 `, values: [prfvms_id, u_id] });

    if (result.affectedRows === 0) {
      const errPrefId = new CustomError('No se ha encontrado ninguna preferencia de VMS con ese ID.', 400, 'Preferencia ID invalido');
      throw errPrefId;
    }

    return;
  }, 'Vms.deletePreferencia');
}
