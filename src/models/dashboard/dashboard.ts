import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { Controlador, RegistroAcceso } from '../../types/db';
import { handleErrorWithArgument } from '../../utils/simpleErrorHandler';
import dayjs from 'dayjs';
import { Personal } from '../general/personal/personal.entity';

interface IPropMethod {
  ctrl_id: Controlador['ctrl_id'];
  isMonthly: boolean;
  date: string;
}

// interface ITotal {
//   total: number;
// }

interface AcumuladoKWHRowDataPacket extends RowDataPacket {
  potenciakwh: number;
  me_id: number;
  ultimo: 0 | 1;
}

interface TotalAccesoTarjetaRemoto {
  tarjeta: { total_registrado_aceptado: number; total_registrado_denegado: number; total_noregistrado_denegado: number };
  remoto: { total_remoto: number };
}

interface AccesoTarjetaRowData extends RowDataPacket {
  acceso_tarjeta: 'no_registrado_denegado' | 'registrado_denegado' | 'registrado_aceptado' | 'otros';
  total: number;
}
interface AccesoRemotoRowData extends RowDataPacket {
  total_acceso_remoto: number;
}

interface MaxTemperaturaRowData extends RowDataPacket {
  st_id: number;
  max_valor: number;
  rtmp_id: number;
  fecha: string;
  serie: string;
  ubicacion: string;
  umbral_alarma: number;
}

interface TotalRowData extends RowDataPacket {
  total: number;
}
interface MaxRowData extends RowDataPacket {
  max: number;
}
interface MaxModEnergyRowData extends RowDataPacket {
  me_id: number;
  descripcion: string;
  max_voltaje: number;
  max_amperaje: number;
  max_potenciaw: number;
}

export interface TotalDashboardResponse {
  data: {
    registers?: Record<any, any>;
    total: number;
  };
  start_date?: string;
  end_date?: string;
}
export interface MaxDashboardResponse {
  data: {
    registers?: Record<any, any>;
    max: number;
  };
  start_date?: string;
  end_date?: string;
}

interface RegAccesoPersonalRowData extends RowDataPacket, RegistroAcceso, Pick<Personal, 'nombre' | 'apellido' | 'foto'> {}

export class Dashboard {
  static #NUM_PARTITION: number = 50;

  private static getStartEndDate(date: string, is_monthly: boolean) {
    const petitionDate = dayjs(date, 'YYYY-MM');
    const startDateTime = petitionDate.startOf(is_monthly ? 'month' : 'year').format('YYYY-MM-DD HH:mm:ss');
    const endDateTime = petitionDate.endOf(is_monthly ? 'month' : 'year').format('YYYY-MM-DD HH:mm:ss');
    return { startDate: startDateTime, endDate: endDateTime, year: petitionDate.year(), month: petitionDate.month() };
  }

  static getTotalActivePinEntrada = handleErrorWithArgument<Record<any, any>[], IPropMethod>(async ({ ctrl_id, isMonthly, date }) => {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const subQuery = `SELECT re.ee_id, COUNT(*) as total_activo FROM ${'nodo' + ctrl_id}.registroentrada ${partitioning} re  WHERE re.fecha BETWEEN '${startDate}' AND '${endDate}' AND re.estado = 1 GROUP BY re.ee_id`;
    const finalQuery = `SELECT totalpinentrada.* , ee.detector , ee.descripcion FROM ( ${subQuery} ) AS totalpinentrada  INNER JOIN general.equipoentrada ee ON totalpinentrada.ee_id = ee.ee_id ORDER BY totalpinentrada.ee_id ASC `;
    const totalPinEntrada = await MySQL2.executeQuery<RowDataPacket[]>({ sql: finalQuery });
    if (totalPinEntrada.length > 0) return totalPinEntrada;
    return [];
  }, 'Dashboard.getTotalActivePinEntrada');

  static getTotalActivePinSalida = handleErrorWithArgument<Record<any, any>[], IPropMethod>(async ({ ctrl_id, isMonthly, date }) => {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    // const finalTable = DashboardConfig.salida.has_yearly_tables ? `registrosalida${year}` : "registrosalida";
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const subQuery = `SELECT rs.es_id , COUNT(*) as total_activo FROM ${'nodo' + ctrl_id}.registrosalida ${partitioning} rs WHERE rs.fecha BETWEEN '${startDate}' AND '${endDate}' AND rs.estado = 1 GROUP BY rs.es_id`;
    const finalQuery = `SELECT totalpinsalida.* , es.actuador , es.descripcion FROM ( ${subQuery} ) AS totalpinsalida INNER JOIN general.equiposalida es ON totalpinsalida.es_id = es.es_id ORDER BY totalpinsalida.es_id ASC`;
    const totalPinSalida = await MySQL2.executeQuery<RowDataPacket[]>({ sql: finalQuery });
    if (totalPinSalida.length > 0) return totalPinSalida;
    return [];
  }, 'Dashboard.getTotalActivePinSalida');

  static async getTotalAlarmas({ ctrl_id, isMonthly, date }: IPropMethod): Promise<TotalDashboardResponse> {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    // const finalTable = DashboardConfig.salida.has_yearly_tables ?`registrosalida${year}` :"registrosalida"
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const totals = await MySQL2.executeQuery<RowDataPacket[]>({ sql: `SELECT COUNT(*) as total FROM ${'nodo' + ctrl_id}.registrosalida ${partitioning} WHERE fecha BETWEEN '${startDate}' AND '${endDate}' AND estado = 1 AND alarma = 1` });
    return { data: { total: totals[0]?.total ?? 0 }, start_date: startDate, end_date: endDate };
  }

  static async countTotalActiveOutputPins({ ctrl_id, date, isMonthly }: IPropMethod): Promise<TotalDashboardResponse> {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const totals = await MySQL2.executeQuery<TotalRowData[]>({ sql: `SELECT COUNT(*) as total FROM ${'nodo' + ctrl_id}.registrosalida ${partitioning} WHERE fecha BETWEEN '${startDate}' AND '${endDate}' AND estado = 1` });
    return { data: { total: totals[0]?.total ?? 0 }, start_date: startDate, end_date: endDate };
  }
  static async listUsedCards({ ctrl_id, date, isMonthly, limit, offset }: IPropMethod & { limit: number; offset: number }) {
    const { endDate, startDate } = Dashboard.getStartEndDate(date, isMonthly);
    const usedCards = await MySQL2.executeQuery<RegAccesoPersonalRowData[]>({
      sql: `SELECT ra.* , p.nombre , p.apellido , p.foto  FROM ${'nodo' + ctrl_id}.registroacceso ra  INNER JOIN general.acceso a  ON ra.serie = a.serie AND ra.p_id = a.p_id AND ra.ea_id = 1 AND ra.fecha BETWEEN '${startDate}' AND '${endDate}' INNER JOIN general.personal p ON ra.p_id = p.p_id ORDER BY ra.ra_id ASC LIMIT ? OFFSET ?`,
      values: [limit, offset],
    });
    return usedCards;
  }
  static async countTotalUsedCards({ ctrl_id, date, isMonthly }: IPropMethod): Promise<number> {
    const { endDate, startDate } = Dashboard.getStartEndDate(date, isMonthly);
    const totals = await MySQL2.executeQuery<TotalRowData[]>({
      sql: `SELECT COUNT(*) as total  FROM ${'nodo' + ctrl_id}.registroacceso ra  INNER JOIN general.acceso a  ON ra.serie = a.serie AND ra.p_id = a.p_id AND ra.ea_id = 1 AND ra.fecha BETWEEN '${startDate}' AND '${endDate}' INNER JOIN general.personal p ON ra.p_id = p.p_id`,
    });
    return totals[0]?.total ?? 0;
  }

  static async countTotalAcceptedAttendedTickets({ ctrl_id, date, isMonthly }: IPropMethod): Promise<TotalDashboardResponse> {
    const { endDate, startDate } = Dashboard.getStartEndDate(date, isMonthly);
    const totals = await MySQL2.executeQuery<TotalRowData[]>({ sql: `SELECT COUNT(*) as total FROM ${'nodo' + ctrl_id}.registroticket  WHERE fechacomienzo BETWEEN '${startDate}' AND '${endDate}' AND ( estd_id = 2 OR estd_id = 21 ) ` });
    return { data: { total: totals[0]?.total ?? 0 }, start_date: startDate, end_date: endDate };
  }

  static async maxModEnergy({ ctrl_id, date, isMonthly }: IPropMethod) {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const maxModEnergies = await MySQL2.executeQuery<MaxModEnergyRowData[]>({
      sql: `SELECT  re.me_id, me.descripcion, MAX(re.voltaje) AS max_voltaje, MAX(re.amperaje) AS max_amperaje, MAX(re.potenciaw) AS max_potenciaw FROM nodo${ctrl_id}.registroenergia ${partitioning} re INNER JOIN nodo${ctrl_id}.medidorenergia me ON re.me_id = me.me_id WHERE re.fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY re.me_id, me.descripcion`,
    });

    return { data: maxModEnergies, start_date: startDate, end_date: endDate };
  }

  static async countTotalAssignedCards(): Promise<TotalDashboardResponse> {
    const totals = await MySQL2.executeQuery<TotalRowData[]>({ sql: `SELECT COUNT(*) as total FROM general.acceso WHERE activo = 1 AND ea_id = 1` });
    return { data: { total: totals[0]?.total ?? 0 } };
  }
  static async generalMaxTemperature({ ctrl_id, date, isMonthly }: IPropMethod): Promise<MaxDashboardResponse> {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const maxs = await MySQL2.executeQuery<MaxRowData[]>({ sql: `SELECT  MAX(valor) AS max FROM ${'nodo' + ctrl_id}.registrotemperatura ${partitioning}  WHERE fecha BETWEEN '${startDate}' AND '${endDate}'` });
    return { data: { max: maxs[0]?.max ?? 0 }, start_date: startDate, end_date: endDate };
  }

  static getCameraStates = handleErrorWithArgument<{ data: Record<any, any>[] }, Pick<Controlador, 'ctrl_id'>>(async ({ ctrl_id }) => {
    const camStates = await MySQL2.executeQuery<RowDataPacket[]>({
      sql: `SELECT c.cmr_id, c.tc_id , t.tipo, c.m_id, m.marca, c.ip , c.descripcion, c.conectado FROM ${'nodo' + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`,
    });
    if (camStates.length > 0) return { data: camStates };

    return { data: [] };
  }, 'Dashboard.getCameraStates');

  static getStates = handleErrorWithArgument<{ states: { camera: Record<any, any>[]; controller: Record<any, any>[] } }, Pick<Controlador, 'ctrl_id'>>(async ({ ctrl_id }) => {
    const camStates = await MySQL2.executeQuery<RowDataPacket[]>({
      sql: `SELECT c.cmr_id, c.tc_id , t.tipo, c.m_id, m.marca, c.ip , c.descripcion, c.conectado FROM ${'nodo' + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`,
    });
    const controllerState = await MySQL2.executeQuery<RowDataPacket[]>({ sql: `SELECT ctrl_id , nodo, direccion, descripcion , conectado FROM general.controlador WHERE ctrl_id = 1;` });
    return { states: { camera: camStates, controller: controllerState } };
  }, 'Dashboard.getCameraStates');

  static getTotalTicketContrata = handleErrorWithArgument<{ data: Record<any, any>[]; start_date: string; end_date: string }, IPropMethod>(async ({ ctrl_id, isMonthly, date }) => {
    const { endDate, startDate } = Dashboard.getStartEndDate(date, isMonthly);

    const subQuery = `SELECT rt.co_id, COUNT(*) AS total_ticket  FROM ${'nodo' + ctrl_id}.registroticket rt WHERE rt.fechacomienzo BETWEEN '${startDate}' AND '${endDate}' AND ( rt.estd_id = 2 OR rt.estd_id = 21 ) GROUP BY rt.co_id`;
    const finalQuery = `SELECT totalticket.* , co.contrata , co.descripcion FROM ( ${subQuery} ) AS totalticket INNER JOIN general.contrata co ON totalticket.co_id = co.co_id ORDER BY totalticket.co_id ASC `;

    const totalTicketContrata = await MySQL2.executeQuery<RowDataPacket[]>({ sql: finalQuery });
    if (totalTicketContrata.length > 0) return { data: totalTicketContrata, start_date: startDate, end_date: endDate };
    return { data: [], start_date: startDate, end_date: endDate };
  }, 'Dashboard.getTotalTicketContrata');

  // actualizar getTotalIngresoContrata
  static getTotalIngresoContrata = handleErrorWithArgument<Record<any, any>[], IPropMethod>(async ({ ctrl_id, isMonthly, date }) => {
    const { endDate, startDate } = Dashboard.getStartEndDate(date, isMonthly);
    const subQuery = `SELECT ra.co_id, COUNT(*) AS total_ingreso FROM ${'nodo' + ctrl_id}.registroacceso ra WHERE ra.fecha BETWEEN '${startDate}' AND '${endDate}' AND ra.tipo = 1 AND ra.autorizacion = 1 GROUP BY ra.co_id`;
    const finalQuery = `SELECT ingresototal.* , co.contrata, co.descripcion FROM ( ${subQuery} ) AS ingresototal INNER JOIN general.contrata co ON ingresototal.co_id = co.co_id ORDER BY ingresototal.co_id `;
    const totalIngresoContrata = await MySQL2.executeQuery<RowDataPacket[]>({ sql: finalQuery });
    if (totalIngresoContrata.length > 0) return totalIngresoContrata;
    return [];
  }, 'Dashboard.getTotalIngresoContrata');

  static getTotalAccesoTarjetaRemoto = handleErrorWithArgument<{ data: TotalAccesoTarjetaRemoto; start_date: string; end_date: string }, IPropMethod>(async ({ ctrl_id, isMonthly, date }) => {
    const { endDate, startDate } = Dashboard.getStartEndDate(date, isMonthly);
    // const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;
    const queryAccesoTarjeta = `SELECT CASE WHEN (p_id = 0 AND autorizacion = 0) THEN 'no_registrado_denegado' WHEN (p_id >= 1 AND autorizacion = 0) THEN 'registrado_denegado' WHEN (p_id >= 1 AND autorizacion = 1) THEN 'registrado_aceptado' ELSE 'otros' END AS acceso_tarjeta, COUNT(*) AS total FROM  ${'nodo' + ctrl_id}.registroacceso WHERE tipo = 1 AND fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY acceso_tarjeta`;
    const queryAccesoRemoto = `SELECT COUNT(*) AS total_acceso_remoto FROM nodo${ctrl_id}.registropeticion WHERE orden = 1 AND estd_id = 11 AND acceso_remoto = 1 AND fecha BETWEEN '${startDate}' AND '${endDate}'`;

    const resultAccesos: TotalAccesoTarjetaRemoto = { tarjeta: { total_noregistrado_denegado: 0, total_registrado_aceptado: 0, total_registrado_denegado: 0 }, remoto: { total_remoto: 0 } };

    const totalAccesoTarjeta = await MySQL2.executeQuery<AccesoTarjetaRowData[]>({ sql: queryAccesoTarjeta });
    if (totalAccesoTarjeta.length > 0) {
      totalAccesoTarjeta.forEach((totalAcc) => {
        if (totalAcc.acceso_tarjeta === 'no_registrado_denegado') resultAccesos.tarjeta.total_noregistrado_denegado = totalAcc.total;
        if (totalAcc.acceso_tarjeta === 'registrado_aceptado') resultAccesos.tarjeta.total_registrado_aceptado = totalAcc.total;
        if (totalAcc.acceso_tarjeta === 'registrado_denegado') resultAccesos.tarjeta.total_registrado_denegado = totalAcc.total;
      });
    }

    const totalAccesoRemoto = await MySQL2.executeQuery<AccesoRemotoRowData[]>({ sql: queryAccesoRemoto });
    if (totalAccesoRemoto.length > 0) {
      resultAccesos.remoto.total_remoto = totalAccesoRemoto[0].total_acceso_remoto;
    }

    return { data: resultAccesos, start_date: startDate, end_date: endDate };
  }, 'Dashboard.getTotalAccesoTarjetaRemoto');

  static async getAcumuladoKWH({ ctrl_id, date, isMonthly }: IPropMethod): Promise<TotalDashboardResponse> {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    // const finalTable = DashboardConfig.energia.has_yearly_tables ?`registroenergia${year}` :"registroenergia"
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;

    const subQuery = `SELECT me_id, MIN(fecha) AS primera_fecha , MAX(fecha) AS ultima_fecha FROM ${'nodo' + ctrl_id}.registroenergia ${partitioning} WHERE fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY me_id`;
    const finalQuery = `SELECT re.me_id, re.potenciakwh,re.fecha , CASE WHEN re.fecha = minmaxregister.primera_fecha THEN 0 WHEN re.fecha = minmaxregister.ultima_fecha THEN 1 ELSE NULL END AS ultimo FROM ${'nodo' + ctrl_id}.registroenergia ${partitioning} re INNER JOIN ( ${subQuery} ) AS minmaxregister ON re.me_id = minmaxregister.me_id AND  (re.fecha = minmaxregister.ultima_fecha OR re.fecha = minmaxregister.primera_fecha )`;

    const acumuladoKwh = await MySQL2.executeQuery<AcumuladoKWHRowDataPacket[]>({ sql: finalQuery });
    const sumAcumulados = acumuladoKwh.reduce(
      (prev, curr) => {
        const result = prev;
        if (curr.ultimo === 1) {
          result.sumFinal = result.sumFinal + curr.potenciakwh;
        } else if (curr.ultimo === 0) {
          result.sumInitial = result.sumInitial + curr.potenciakwh;
        }
        return result;
      },
      { sumInitial: 0, sumFinal: 0 },
    );

    const acumFinal = sumAcumulados.sumFinal - sumAcumulados.sumInitial > 0 ? sumAcumulados.sumFinal - sumAcumulados.sumInitial : 0;

    return { data: { total: acumFinal }, start_date: startDate, end_date: endDate };
  }

  static getMaxSensorTemperatura = handleErrorWithArgument<{ data: MaxTemperaturaRowData[]; start_date: string; end_date: string }, IPropMethod>(async ({ ctrl_id, isMonthly, date }) => {
    const { endDate, startDate, year } = Dashboard.getStartEndDate(date, isMonthly);
    // const finalTable = DashboardConfig.temperatura.has_yearly_tables ?`registrotemperatura${year}` :"registrotemperatura"
    const partitioning = `PARTITION (p${year % Dashboard.#NUM_PARTITION})`;

    // subQuery1 quitar 'AND valor > 0'
    const subQuery1 = `SELECT rt.st_id, MAX(rt.valor) AS max_valor  FROM ${'nodo' + ctrl_id}.registrotemperatura ${partitioning} rt WHERE rt.fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY rt.st_id`; //  AND valor > 0 GROUP BY rt.st_id
    const subQuery2 = `SELECT max_temp.* , rt.rtmp_id , rt.fecha FROM ${'nodo' + ctrl_id}.registrotemperatura ${partitioning} rt INNER JOIN ( ${subQuery1} ) max_temp ON rt.st_id = max_temp.st_id AND rt.valor = max_temp.max_valor WHERE rt.fecha BETWEEN '${startDate}' AND '${endDate}'`;
    const finalQuery2 = `SELECT maxtemperatura.* , st.serie , st.ubicacion, st.umbral_alarma FROM ( ${subQuery2} ) AS maxtemperatura INNER JOIN nodo1.sensortemperatura st ON maxtemperatura.st_id = st.st_id WHERE st.activo = 1 ORDER BY maxtemperatura.st_id ASC`;

    const maxTempSensor = await MySQL2.executeQuery<MaxTemperaturaRowData[]>({ sql: finalQuery2 });

    if (maxTempSensor.length > 0) {
      return { data: maxTempSensor, start_date: startDate, end_date: endDate };
    }
    return { data: [], start_date: startDate, end_date: endDate };
  }, 'Dashboard.getMaxSensorTemperatura');
}
