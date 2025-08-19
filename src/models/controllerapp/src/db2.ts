import { RowDataPacket } from 'mysql2';
import * as db from '../../../types/db';

/**
 * Firmware data from the database
 */
export interface FirmwareData extends RowDataPacket {
  archivo: string;
  mayor: number;
  menor: number;
  parche: number;
}

/**
 *
 */
export interface GeneralData extends RowDataPacket {
  nombreempresa: string;
  correoadministrador: string;
  celular: number;
  com: string;
}

/**
 * To load nodes from the database
 *
 */
export interface Controlador2 extends db.Controlador, RowDataPacket {}

/**
 * To get the next ID for a table
 */
export interface ID extends RowDataPacket {
  AUTO_INCREMENT: number;
}

export interface OneTicket extends RowDataPacket {
  co_id: number;
  fechacomienzo: string;
  fechatermino: string;
  estd_id: number;
}

export interface CameraForDetection extends RowDataPacket {
  cmr_id: number;
  ip: string;
}

export interface Ticket extends RowDataPacket {
  rt_id: number;
  co_id: number;
  fechacomienzo: string;
  fechatermino: string;
}

/**
 * To get a general number
 */
export interface GeneralNumber extends RowDataPacket {
  entero: number;
}

/**
 * To load nodes from the database
 */
export interface UserPassword extends RowDataPacket {
  u_id: number;
  contraseña: string;
}

export interface DeviceID extends RowDataPacket {
  device_id: number;
}

/**
 * To load workers and get the photo field
 */
export interface Personal2 extends db.Personal, RowDataPacket {}

/**
 * To load node from the database
 */
export interface Controlador2 extends db.Controlador, RowDataPacket {}

export interface Usuario2 extends RowDataPacket {
  u_id: number;
  usuario: string;
  rl_id: number;
  fecha: string;
  p_id: number;
}

export interface CardInfo extends RowDataPacket {
  p_id: number;
  ea_id: number;
}

export interface CardForController extends RowDataPacket {
  a_id: number;
  serie: number;
  administrador: number;
  co_id: number;
  activo: boolean;
}

export interface GeneralString extends RowDataPacket {
  text: string;
}
