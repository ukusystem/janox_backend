import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../database/mysql';
import type { ActividadPersonal, ArchivoTicket, Cargo, Contrata, Controlador, Estado, Personal, Region, RegistroTicket, TipoTrabajo } from '../types/db';
import { handleErrorWithArgument, handleErrorWithoutArgument } from '../utils/simpleErrorHandler';
import { Init } from './init';
import { UserInfo } from './auth';
import { CustomError } from '../utils/CustomError';
import dayjs from 'dayjs';
import { RegistroTicketPagination } from '../schemas/ticket';
import { UserRol } from '../types/rol';

type PersonalInfo = Pick<Personal, 'p_id' | 'nombre' | 'apellido' | 'telefono' | 'dni' | 'c_id' | 'co_id' | 'foto'> & Pick<Cargo, 'cargo'>;
type PersonalSolicitante = Personal & Pick<Cargo, 'cargo'> & Pick<Contrata, 'contrata'>;
type ControllerInfo = Pick<Controlador, 'ctrl_id' | 'nodo' | 'rgn_id'> & Pick<Region, 'region'>;
type RegionNodo = Pick<Region, 'region'> & Pick<Controlador, 'ctrl_id' | 'nodo'>;
type ActividaPersonalDetail = ActividadPersonal & Pick<Cargo, 'cargo'> & Pick<Contrata, 'contrata'>;
type TotalRegistroTicket = { total: number };
type RegistroTicketDetail = RegistroTicket & Pick<Estado, 'estado'> & { tipotrabajo: string } & Pick<Contrata, 'contrata'> & Pick<Personal, 'nombre' | 'apellido'>;

interface RegistroTicketRowData extends RowDataPacket, RegistroTicket {}
interface TipoTrabajoRowData extends RowDataPacket, TipoTrabajo {}
interface PersonalRowData extends RowDataPacket, PersonalInfo {}
interface RegionNodoRowData extends RowDataPacket, RegionNodo {}
interface CargoRowData extends RowDataPacket, Cargo {}

interface PersonalSolicitanteRowData extends RowDataPacket, PersonalSolicitante {}
interface ActividaPersonalDetailRowData extends RowDataPacket, ActividaPersonalDetail {}
interface ArchivoRowData extends RowDataPacket, ArchivoTicket {}
interface TotalRegistroTicketRowData extends RowDataPacket, TotalRegistroTicket {}
interface RegistroTicketDetailRowData extends RowDataPacket, RegistroTicketDetail {}
interface ContrataRowData extends RowDataPacket, Contrata {}

export class Ticket {
  static getContratas = handleErrorWithoutArgument<Contrata[]>(async () => {
    const contratas = await MySQL2.executeQuery<ContrataRowData[]>({ sql: `SELECT * FROM general.contrata WHERE activo = 1` });
    return contratas;
  });

  static getTicketsByControladorId = handleErrorWithArgument<RegistroTicket[], Pick<Controlador, 'ctrl_id'>>(async ({ ctrl_id }) => {
    const registroTickets = await MySQL2.executeQuery<RegistroTicketRowData[]>({ sql: `SELECT * FROM ${'nodo' + ctrl_id}.registroticket r ORDER BY r.rt_id DESC` });

    if (registroTickets.length > 0) {
      return registroTickets;
    }
    return [];
  }, 'Ticket.getTicketsByControladorId');

  static getTicketsPendientesByControladorId = handleErrorWithArgument<RegistroTicket[], Pick<Controlador, 'ctrl_id'>>(async ({ ctrl_id }) => {
    const registroTickets = await MySQL2.executeQuery<RegistroTicketRowData[]>({ sql: `SELECT * FROM ${'nodo' + ctrl_id}.registroticket r WHERE r.estd_id = 1` });

    if (registroTickets.length > 0) {
      return registroTickets;
    }
    return [];
  }, 'Ticket.getTicketsByControladorId');

  static getTicketsAceptadosByCtrlId24H = handleErrorWithArgument<RegistroTicket[], Pick<Controlador, 'ctrl_id'> & { fecha0M24: string }>(async ({ ctrl_id, fecha0M24 }) => {
    const registroTickets = await MySQL2.executeQuery<RegistroTicketRowData[]>({ sql: `SELECT * FROM ${'nodo' + ctrl_id}.registroticket WHERE fechacomienzo > ? AND estd_id = 2 `, values: [fecha0M24] });

    if (registroTickets.length > 0) {
      return registroTickets;
    }
    return [];
  }, 'Ticket.getTicketsAceptadosByCtrlId24H');

  static getTiposTrabajo = handleErrorWithoutArgument<TipoTrabajo[]>(async () => {
    const registrosTipoTrabajo = await MySQL2.executeQuery<TipoTrabajoRowData[]>({ sql: `SELECT * FROM general.tipotrabajo` });

    if (registrosTipoTrabajo.length > 0) {
      return registrosTipoTrabajo;
    }
    return [];
  }, 'Ticket.getTiposTrabajo');

  static getPersonalesByContrataId = handleErrorWithArgument<PersonalInfo[], Pick<Contrata, 'co_id'>>(async ({ co_id }) => {
    const personalesContrata = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT p_id, nombre,apellido, telefono, dni , co_id, foto, c.c_id, c.cargo FROM general.personal p INNER JOIN general.cargo c ON p.c_id = c.c_id WHERE p.co_id = ? AND p.activo = 1`, values: [co_id] });

    if (personalesContrata.length > 0) {
      return personalesContrata;
    }
    return [];
  }, 'Ticket.getPersonalesByContrataId');

  static getNodos = handleErrorWithoutArgument<RegionNodo[]>(async () => {
    const regionNodo = await MySQL2.executeQuery<RegionNodoRowData[]>({ sql: `SELECT r.region, c.nodo, c.ctrl_id  FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo = 1` });

    if (regionNodo.length > 0) {
      return regionNodo;
    }
    return [];
  }, 'Ticket.getNodos');

  static getTicketByCrtlIdAndTicketId = handleErrorWithArgument<RegistroTicket | null, Pick<Controlador, 'ctrl_id'> & Pick<RegistroTicket, 'rt_id'>>(async ({ ctrl_id, rt_id }) => {
    const ticket = await MySQL2.executeQuery<RegistroTicketRowData[]>({ sql: `SELECT * FROM ${'nodo' + ctrl_id}.registroticket r WHERE r.rt_id = ?`, values: [rt_id] });

    if (ticket.length > 0) {
      return ticket[0];
    }
    return null;
  }, 'Ticket.getTicketByCrtlIdAndTicketId');

  static getCargos = handleErrorWithoutArgument<Cargo[]>(async () => {
    const cargosData = await MySQL2.executeQuery<CargoRowData[]>({ sql: `SELECT * FROM general.cargo` });

    if (cargosData.length > 0) {
      return cargosData;
    }
    return [];
  }, 'Ticket.getCargos');

  static getSolicitante = handleErrorWithArgument<PersonalSolicitante | null, Pick<Personal, 'p_id'>>(async ({ p_id }) => {
    const personal = await MySQL2.executeQuery<PersonalSolicitanteRowData[]>({
      sql: `SELECT p.p_id, p.nombre, p.apellido, p.telefono, p.dni, p.c_id , ca.cargo , p.co_id, co.contrata , p.foto, p.correo , p.activo FROM general.personal p INNER JOIN general.cargo ca ON p.c_id = ca.c_id INNER JOIN general.contrata co ON p.co_id = co.co_id WHERE p.p_id = ?`,
      values: [p_id],
    });

    if (personal.length > 0) {
      return personal[0];
    }
    return null;
  }, 'Ticket.getSolicitante');

  static getActividaPersonal = handleErrorWithArgument<ActividaPersonalDetail[], { ctrl_id: number; rt_id: number }>(async ({ ctrl_id, rt_id }) => {
    const actividadPersonal = await MySQL2.executeQuery<ActividaPersonalDetailRowData[]>({
      sql: `SELECT ap.ap_id, ap.nombre,ap.apellido, ap.telefono, ap.dni , ap.c_id, ca.cargo, ap.co_id, co.contrata, ap.rt_id, ap.foto FROM ${'nodo' + ctrl_id}.actividadpersonal ap INNER JOIN general.cargo ca ON ap.c_id = ca.c_id INNER JOIN general.contrata co ON ap.co_id = co.co_id WHERE ap.rt_id = ? `,
      values: [rt_id],
    });

    if (actividadPersonal.length > 0) {
      return actividadPersonal;
    }
    return [];
  }, 'Ticket.getActividaPersonal');

  static getArchivosCargados = handleErrorWithArgument<ArchivoTicket[], { ctrl_id: number; rt_id: number }>(async ({ ctrl_id, rt_id }) => {
    const archivos = await MySQL2.executeQuery<ArchivoRowData[]>({ sql: `SELECT * FROM nodo${ctrl_id}.archivoticket a WHERE a.rt_id = ? `, values: [rt_id] });

    if (archivos.length > 0) {
      return archivos;
    }

    return [];
  }, 'Ticket.getArchivosCargados');

  static getTicketsPendientesAceptados = handleErrorWithoutArgument<(RegistroTicket & { ctrl_id: number })[] | []>(async () => {
    const backDateHour = dayjs().startOf('date').subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
    const region_nodos = await Init.getRegionNodos();
    if (region_nodos.length > 0) {
      const allRegistros = await region_nodos.reduce<Promise<(RegistroTicket & { ctrl_id: number })[]>>(async (acc, item) => {
        const resultAcc = await acc;
        const { ctrl_id } = item;
        const registroTicketsPend = await Ticket.getTicketsPendientesByControladorId({ ctrl_id });
        if (registroTicketsPend.length > 0) {
          const finalRegistroTickets = registroTicketsPend.map((ticket) => ({ ...ticket, ctrl_id }));
          resultAcc.push(...finalRegistroTickets);
        }
        const regisTickAcep = await Ticket.getTicketsAceptadosByCtrlId24H({ ctrl_id: ctrl_id, fecha0M24: backDateHour });
        if (regisTickAcep.length > 0) {
          const finalRegisTickAcep = regisTickAcep.map((ticket) => ({ ...ticket, ctrl_id }));
          resultAcc.push(...finalRegisTickAcep);
        }
        return resultAcc;
      }, Promise.resolve([]));
      return allRegistros;
    }
    return [];
  }, 'Ticket.getTicketsPendientesAceptados');

  static getRegistrosByCtrlIdAndLimitAndOffset = handleErrorWithArgument<RegistroTicketDetail[], { ctrl_id: number; limit: number; offset: number; user: UserInfo; filters?: RegistroTicketPagination['filters'] }>(async ({ ctrl_id, limit, offset, user, filters }) => {
    let whereFilter: { whereQuery: string; valuesQuery: any[] } | undefined = undefined;
    if (filters !== undefined) {
      if (filters.state !== undefined) {
        const uniqueStates = Array.from(new Set(filters.state));

        const whereQuery = uniqueStates.reduce<{ whereQuery: string; valuesQuery: any[] }>(
          (prev, curr, index) => {
            const result = prev;
            result.whereQuery = result.whereQuery.trim() + ' rt.estd_id = ? ' + (index < uniqueStates.length - 1 ? ' OR ' : ' ) ');
            result.valuesQuery.push(curr);

            return result;
          },
          { whereQuery: ' ( ', valuesQuery: [] },
        );
        whereFilter = whereQuery;
      }

      if (filters.dateRange !== undefined) {
        const { end: endDate, start: startDate } = filters.dateRange;
        if (whereFilter !== undefined) {
          whereFilter.whereQuery = whereFilter.whereQuery.trim() + ' AND ( DATE( rt.fechacomienzo ) >= ? AND DATE( rt.fechatermino ) <= ? ) ';
          whereFilter.valuesQuery.push(startDate, endDate);
        } else {
          whereFilter = {
            whereQuery: ' DATE( rt.fechacomienzo ) >= ? AND DATE( rt.fechatermino ) <= ? ',
            valuesQuery: [startDate, endDate],
          };
        }
      }

      if (filters.priority !== undefined) {
        const priority = filters.priority;
        if (whereFilter !== undefined) {
          whereFilter.whereQuery = whereFilter.whereQuery.trim() + ' AND rt.prioridad = ? ';
          whereFilter.valuesQuery.push(priority);
        } else {
          whereFilter = {
            whereQuery: ' rt.prioridad = ? ',
            valuesQuery: [priority],
          };
        }
      }
    }

    if (user.rl_id === UserRol.Invitado) {
      const registroTickets = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({
        sql: `SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${'nodo' + ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id WHERE rt.co_id = ? ${whereFilter !== undefined ? ` AND ${whereFilter.whereQuery} ` : ''} ORDER BY rt.rt_id DESC LIMIT ? OFFSET ? `,
        values: whereFilter !== undefined ? [user.co_id, ...whereFilter.valuesQuery, limit, offset] : [user.co_id, limit, offset],
      });

      if (registroTickets.length > 0) {
        return registroTickets;
      }
      return [];
    } else if (user.rl_id === UserRol.Administrador || user.rl_id === UserRol.Gestor) {
      const registroTickets = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({
        sql: `SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${'nodo' + ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id ${whereFilter !== undefined ? `WHERE ${whereFilter.whereQuery}` : ''} ORDER BY rt.rt_id DESC LIMIT ? OFFSET ? `,
        values: whereFilter !== undefined ? [...whereFilter.valuesQuery, limit, offset] : [limit, offset],
      });

      if (registroTickets.length > 0) {
        return registroTickets;
      }
      return [];
    } else {
      const errUserRol = new CustomError('Rol de usuario no contemplado', 500, 'user-rol-notimplemented');
      throw errUserRol;
    }
  }, 'Ticket.getRegistrosByCtrlIdAndLimitAndOffset');

  static getSingleRegistroTicketByCtrlIdAndRtId = handleErrorWithArgument<RegistroTicketDetail | null, { rt_id: number; ctrl_id: number; user: UserInfo }>(async ({ rt_id, ctrl_id, user }) => {
    if (user.rl_id === UserRol.Invitado) {
      const singleRegistroTicket = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({
        sql: `SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${'nodo' + ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id WHERE rt.rt_id = ? AND rt.co_id = ? `,
        values: [rt_id, user.co_id],
      });

      if (singleRegistroTicket.length > 0) {
        return singleRegistroTicket[0];
      }
      return null;
    } else if (user.rl_id === UserRol.Administrador || user.rl_id === UserRol.Gestor) {
      const singleRegistroTicket = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({
        sql: `SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${'nodo' + ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id WHERE rt.rt_id = ? `,
        values: [rt_id],
      });

      if (singleRegistroTicket.length > 0) {
        return singleRegistroTicket[0];
      }
      return null;
    } else {
      const errUserRol = new CustomError('Rol de usuario no contemplado', 500, 'user-rol-notimplemented');
      throw errUserRol;
    }
  }, 'Ticket.getSingleRegistroTicketByCtrlIdAndRtId');

  static getTotalRegistroTicketByCtrlId = handleErrorWithArgument<number, { ctrl_id: number; user: UserInfo; filters?: RegistroTicketPagination['filters'] }>(async ({ ctrl_id, user, filters }) => {
    let whereFilter: { whereQuery: string; valuesQuery: any[] } | undefined = undefined;
    if (filters !== undefined) {
      if (filters.state !== undefined) {
        const uniqueStates = Array.from(new Set(filters.state));

        const whereQuery = uniqueStates.reduce<{ whereQuery: string; valuesQuery: any[] }>(
          (prev, curr, index) => {
            const result = prev;
            result.whereQuery = result.whereQuery.trim() + ' estd_id = ? ' + (index < uniqueStates.length - 1 ? ' OR ' : ' ) ');
            result.valuesQuery.push(curr);

            return result;
          },
          { whereQuery: ' ( ', valuesQuery: [] },
        );
        whereFilter = whereQuery;
      }

      if (filters.dateRange !== undefined) {
        const { end: endDate, start: startDate } = filters.dateRange;
        if (whereFilter !== undefined) {
          whereFilter.whereQuery = whereFilter.whereQuery.trim() + ' AND ( DATE( fechacomienzo ) >= ? AND DATE( fechatermino ) <= ? ) ';
          whereFilter.valuesQuery.push(startDate, endDate);
        } else {
          whereFilter = {
            whereQuery: ' DATE( fechacomienzo ) >= ? AND DATE( fechatermino ) <= ?',
            valuesQuery: [startDate, endDate],
          };
        }
      }

      if (filters.priority !== undefined) {
        const priority = filters.priority;
        if (whereFilter !== undefined) {
          whereFilter.whereQuery = whereFilter.whereQuery.trim() + ' AND prioridad = ? ';
          whereFilter.valuesQuery.push(priority);
        } else {
          whereFilter = {
            whereQuery: ' prioridad = ? ',
            valuesQuery: [priority],
          };
        }
      }
    }

    if (user.rl_id === UserRol.Invitado) {
      const totalRegistros = await MySQL2.executeQuery<TotalRegistroTicketRowData[]>({
        sql: `SELECT COUNT(*) AS total FROM ${'nodo' + ctrl_id}.registroticket WHERE co_id = ? ${whereFilter !== undefined ? ` AND ${whereFilter.whereQuery} ` : ''}`,
        values: whereFilter !== undefined ? [user.co_id, ...whereFilter.valuesQuery] : [user.co_id],
      });

      if (totalRegistros.length > 0) {
        return totalRegistros[0].total;
      }
      return 0;
    } else if (user.rl_id === UserRol.Administrador || user.rl_id === UserRol.Gestor) {
      const totalRegistros = await MySQL2.executeQuery<TotalRegistroTicketRowData[]>({
        sql: `SELECT COUNT(*) AS total FROM ${'nodo' + ctrl_id}.registroticket ${whereFilter !== undefined ? ` WHERE ${whereFilter.whereQuery}` : ''}`,
        values: whereFilter !== undefined ? whereFilter.valuesQuery : undefined,
      });

      if (totalRegistros.length > 0) {
        return totalRegistros[0].total;
      }
      return 0;
    } else {
      const errUserRol = new CustomError('Rol de usuario no contemplado', 500, 'user-rol-notimplemented');
      throw errUserRol;
    }
  }, 'Ticket.getTotalRegistroTicketByCtrlId');

  static getAllTicketDetails = handleErrorWithArgument<null | { solicitante: PersonalSolicitante; ticket: RegistroTicketDetail; personales: ActividaPersonalDetail[]; archivos_respaldo: ArchivoTicket[]; controller: ControllerInfo }, { rt_id: number; ctrl_id: number; user: UserInfo }>(
    async ({ ctrl_id, rt_id, user }) => {
      const ticket = await Ticket.getSingleRegistroTicketByCtrlIdAndRtId({ ctrl_id, rt_id, user });
      if (ticket) {
        const solicitante = await Ticket.getSolicitante({ p_id: ticket.p_id });
        const personales = await Ticket.getActividaPersonal({ ctrl_id, rt_id: ticket.rt_id });
        const archivosRespaldo = await Ticket.getArchivosCargados({ ctrl_id, rt_id: ticket.rt_id });
        const controller = await Ticket.getControllerInfo(ctrl_id);

        const result = {
          solicitante: solicitante!,
          ticket,
          personales,
          archivos_respaldo: archivosRespaldo,
          controller: controller!,
        };

        return result;
      }

      return null;
    },
    'Ticket.getAllTicketDetails',
  );

  static async getControllerInfo(ctrl_id: number): Promise<ControllerInfo | undefined> {
    const controllers = await MySQL2.executeQuery<ControllerRowData[]>({
      sql: `SELECT c.ctrl_id ,c.nodo ,c.rgn_id , r.region FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE ctrl_id = ?`,
      values: [ctrl_id],
    });

    return controllers[0];
  }
}

interface ControllerRowData extends RowDataPacket {
  ctrl_id: number;
  nodo: string;
  rgn_id: number;
  region: string;
}
