// import { acceleratedmobilepageurl } from "googleapis/build/src/apis/acceleratedmobilepageurl";
import { LoadedFile } from './types';
// import { Personal, Solicitante } from "../../../controllers/ticket";
import * as useful from './useful';
import { States } from './enums';

export interface Personal {
  c_id: number;
  co_id: number;
  dni: string;
  foto: null | string;
  nombre: string;
  apellido: string;
  telefono: string;
  isNew: boolean;
}

export interface Solicitante {
  telefono: string;
  correo: string;
  descripcion: string;
  fechacomienzo: number;
  fechatermino: number;
  prioridad: number;
  p_id: number;
  tt_id: number;
  sn_id: number;
  co_id: number;
  ctrl_id: number;
}
/**
 * Structure of the ticket received from the web application to CREATE a ticket
 * in the database. The acceptance or rejection of the ticket is done by an
 * administrator in a different request from the web application. The
 * cancellation of the ticket is done by the solicitor in the web application,
 * which generates a different request.
 */
export class Ticket {
  readonly solicitante: Solicitante;
  readonly archivos_cargados: LoadedFile[];
  readonly personales: Personal[];

  constructor(archivos: LoadedFile[], solicitante: Solicitante, personales: Personal[]) {
    this.archivos_cargados = archivos;
    this.solicitante = solicitante;
    this.personales = personales;
  }

  /**
   * Convert this instance to an array that fits the parameters needed by
   * {@linkcode queries.insertTicket}. (telefono, correo, descripcion, fechacomienzo, fechatermino, estd_id,
   * fechacreacion, prioridad, p_id, tt_id, sn_id, co_id, enviado)
   *
   * @returns Array of parameters.
   */
  public toArrayForQuery(): any[] {
    return [
      this.solicitante.telefono,
      this.solicitante.correo,
      this.solicitante.descripcion,
      useful.formatTimestamp(this.solicitante.fechacomienzo),
      useful.formatTimestamp(this.solicitante.fechatermino),
      States.WAITING_APPROVE,
      useful.getCurrentDate(),
      this.solicitante.prioridad,
      this.solicitante.p_id,
      this.solicitante.tt_id,
      this.solicitante.sn_id,
      this.solicitante.co_id,
    ];
  }

  toString(): string {
    return `Start '${this.solicitante.fechacomienzo}' End '${this.solicitante.fechatermino}' Nodo ${this.solicitante.ctrl_id}`;
  }
}
