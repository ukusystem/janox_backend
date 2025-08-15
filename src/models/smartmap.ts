import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../database/mysql';
import { Camara, Controlador, EquipoEntrada, EquipoSalida, Marca, PinesEntrada, PinesSalida, Region, TipoCamara } from '../types/db';
import { handleErrorWithArgument, handleErrorWithoutArgument } from '../utils/simpleErrorHandler';

type ControladorInfo = Pick<Controlador, 'ctrl_id' | 'nodo' | 'rgn_id' | 'direccion' | 'descripcion' | 'latitud' | 'longitud' | 'serie' | 'ip' | 'personalgestion' | 'personalimplementador' | 'conectado'> & Pick<Region, 'region'>;
type CameraInfo = Pick<Camara, 'cmr_id' | 'serie' | 'tc_id' | 'm_id' | 'ip' | 'descripcion' | 'conectado'> & Pick<TipoCamara, 'tipo'> & Pick<Marca, 'marca'>;
type EquipoEntradaDisponible = Pick<EquipoEntrada, 'ee_id' | 'detector'>;
type EquipoEntradaInfo = Pick<PinesEntrada, 'pe_id' | 'pin' | 'ee_id' | 'descripcion' | 'estado'> & Pick<EquipoEntrada, 'detector'>;
type EquipoSalidaDisponible = Pick<EquipoSalida, 'es_id' | 'actuador'>;
type EquipoSalidaInfo = Pick<PinesSalida, 'ps_id' | 'pin' | 'es_id' | 'descripcion' | 'estado'> & Pick<EquipoSalida, 'actuador'>;

interface ControladorInfoRowData extends RowDataPacket, ControladorInfo {}
interface CameraInfoRowData extends RowDataPacket, CameraInfo {}
interface EquipoEntradaDisponibleRowData extends RowDataPacket, EquipoEntradaDisponible {}
interface EquipoEntradaInfoRowData extends RowDataPacket, EquipoEntradaInfo {}
interface EquipoSalidaDisponibleRowData extends RowDataPacket, EquipoSalidaDisponible {}
interface EquipoSalidaInfoRowData extends RowDataPacket, EquipoSalidaInfo {}

interface InputPinRowData extends RowDataPacket, PinesEntrada {
  detector: string;
}
interface OutputPinRowData extends RowDataPacket, PinesSalida {
  actuador: string;
}

export class SmartMap {
  static getControladorInfoByCtrlId = handleErrorWithArgument<ControladorInfo | null, { ctrl_id: number }>(async ({ ctrl_id }) => {
    const controladorInfo = await MySQL2.executeQuery<ControladorInfoRowData[]>({
      sql: `SELECT c.ctrl_id, c.nodo, c.rgn_id, r.region , c.direccion, c.descripcion, c.latitud, c.longitud , c.serie, c.ip , c.personalgestion , c.personalimplementador , c.conectado FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo = 1 AND c.ctrl_id = ?`,
      values: [ctrl_id],
    });

    if (controladorInfo.length > 0) {
      return controladorInfo[0];
    }
    return null;
  }, 'SmartMap.getControladorInfoByCtrlId');

  static getAllControllers = handleErrorWithoutArgument<ControladorInfo[]>(async () => {
    const controladores = await MySQL2.executeQuery<ControladorInfoRowData[]>({
      sql: `SELECT c.ctrl_id, c.nodo, c.rgn_id, r.region , c.direccion, c.descripcion, c.latitud, c.longitud , c.serie, c.ip , c.personalgestion , c.personalimplementador , c.conectado FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo = 1 `,
    });
    return controladores;
  }, 'SmartMap.getControladorInfoByCtrlId');

  static getCamerasInfoByCtrlId = handleErrorWithArgument<CameraInfo[] | [], { ctrl_id: number }>(async ({ ctrl_id }) => {
    const cameraData = await MySQL2.executeQuery<CameraInfoRowData[]>({
      sql: `SELECT c.cmr_id, c.serie, c.tc_id , t.tipo, c.m_id, m.marca, c.ip , c.descripcion, c.conectado FROM ${'nodo' + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`,
    });

    if (cameraData.length > 0) {
      return cameraData;
    }
    return [];
  }, 'SmartMap.getCamerasInfoByCtrlId');

  static getEquiposEntradaDisponibleByCtrlId = handleErrorWithArgument<EquipoEntradaDisponible[] | [], { ctrl_id: number }>(async ({ ctrl_id }) => {
    const equipEntrDis = await MySQL2.executeQuery<EquipoEntradaDisponibleRowData[]>({ sql: `SELECT DISTINCT ee.ee_id , ee.detector FROM ${'nodo' + ctrl_id}.pinesentrada pe INNER JOIN general.equipoentrada ee ON pe.ee_id = ee.ee_id WHERE pe.activo =1` });

    if (equipEntrDis.length > 0) {
      return equipEntrDis;
    }
    return [];
  }, 'SmartMap.getEquiposEntradaDisponibleByCtrlId');

  static getEquiposEntradaByCtrlIdAndEquiEntId = handleErrorWithArgument<EquipoEntradaInfo[] | [], { ctrl_id: number; ee_id: number }>(async ({ ctrl_id, ee_id }) => {
    const equipEntr = await MySQL2.executeQuery<EquipoEntradaInfoRowData[]>({
      sql: `SELECT pe_id, pin, pe.ee_id , ee.detector , pe.descripcion, pe.estado FROM ${'nodo' + ctrl_id}.pinesentrada pe INNER JOIN general.equipoentrada ee ON pe.ee_id = ee.ee_id WHERE pe.activo =1 AND pe.ee_id = ?`,
      values: [ee_id],
    });

    if (equipEntr.length > 0) {
      return equipEntr;
    }
    return [];
  }, 'SmartMap.getEquiposEntradaByCtrlIdAndEquiEntId');

  static async getInputPins(ctrl_id: number): Promise<InputPinRowData[]> {
    const inputPins = await MySQL2.executeQuery<InputPinRowData[]>({
      sql: `SELECT pe.* , ee.detector FROM ${'nodo' + ctrl_id}.pinesentrada pe INNER JOIN general.equipoentrada ee ON pe.ee_id = ee.ee_id WHERE pe.activo = 1`,
    });

    return inputPins;
  }
  static async getOutputPins(ctrl_id: number): Promise<OutputPinRowData[]> {
    const outputPins = await MySQL2.executeQuery<OutputPinRowData[]>({
      sql: `SELECT ps.* , es.actuador FROM ${'nodo' + ctrl_id}.pinessalida ps INNER JOIN general.equiposalida es ON ps.es_id = es.es_id WHERE ps.activo = 1`,
    });

    return outputPins;
  }

  static getEquiposSalidaDisponibleByCtrlId = handleErrorWithArgument<EquipoSalidaDisponible[] | [], { ctrl_id: number }>(async ({ ctrl_id }) => {
    const equipSalDis = await MySQL2.executeQuery<EquipoSalidaDisponibleRowData[]>({ sql: `SELECT DISTINCT es.es_id , es.actuador FROM ${'nodo' + ctrl_id}.pinessalida ps INNER JOIN general.equiposalida es ON ps.es_id = es.es_id WHERE ps.activo =1` });

    if (equipSalDis.length > 0) {
      return equipSalDis;
    }
    return [];
  }, 'SmartMap.getEquiposSalidaDisponibleByCtrlId');

  static getEquiposSalidaByCtrlIdAndEquiSalId = handleErrorWithArgument<EquipoSalidaInfo[] | [], { ctrl_id: number; es_id: number }>(async ({ ctrl_id, es_id }) => {
    const equipSal = await MySQL2.executeQuery<EquipoSalidaInfoRowData[]>({
      sql: `SELECT ps_id, pin, ps.es_id , es.actuador , ps.descripcion, ps.estado FROM ${'nodo' + ctrl_id}.pinessalida ps INNER JOIN general.equiposalida es ON ps.es_id = es.es_id WHERE ps.activo =1 AND ps.es_id = ?`,
      values: [es_id],
    });

    if (equipSal.length > 0) {
      return equipSal;
    }
    return [];
  }, 'SmartMap.getEquiposSalidaByCtrlIdAndEquiEntId');
}
