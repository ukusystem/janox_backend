import { RowDataPacket } from "mysql2";
import { Controlador, Resolucion } from "../../types/db";

// ==================== CONTROLLER ====================
export enum ControllerMode {
  Libre = 0,
  Seguridad = 1,
}

export enum ControllerSecurity {
  Desarmado = 0,
  Armado = 1,
}

export enum ControllerConnect {
  Desconectado = 0,
  Conectado = 1,
}

export enum ControllerActive {
  Desactivado = 0,
  Activo = 1,
}

export interface ControllerMotion {
  MOTION_RECORD_SECONDS: number;
  MOTION_RECORD_RESOLUTION: Resolucion;
  MOTION_RECORD_FPS: number;

  MOTION_SNAPSHOT_SECONDS: number;
  MOTION_SNAPSHOT_RESOLUTION: Resolucion;
  MOTION_SNAPSHOT_INTERVAL: number;
}

export interface ControllerStream {
  STREAM_PRIMARY_RESOLUTION: Resolucion;
  STREAM_PRIMARY_FPS: number;

  STREAM_SECONDARY_RESOLUTION: Resolucion;
  STREAM_SECONDARY_FPS: number;

  STREAM_AUXILIARY_RESOLUTION: Resolucion;
  STREAM_AUXILIARY_FPS: number;
}

export interface ControllerConfig extends ControllerMotion, ControllerStream {
  CONTROLLER_MODE: ControllerMode;
  CONTROLLER_SECURITY: ControllerSecurity;
  CONTROLLER_CONNECT: ControllerConnect;
}

type ControllerConfigDB = Omit<
  ControllerConfig,
  | "MOTION_RECORD_RESOLUTION"
  | "MOTION_SNAPSHOT_RESOLUTION"
  | "STREAM_PRIMARY_RESOLUTION"
  | "STREAM_SECONDARY_RESOLUTION"
  | "STREAM_AUXILIARY_RESOLUTION"
>;

export interface ControllerConfigRowData extends RowDataPacket, ControllerConfigDB {
  ctrl_id: number;
  res_id_motionrecord: number;
  res_id_motionsnapshot: number;
  res_id_streamprimary: number;
  res_id_streamsecondary: number;
  res_id_streamauxiliary: number;
}

export interface ControllerResolucionRowData extends RowDataPacket, Resolucion {}

export type ControllerUpdateFunction<T extends keyof ControllerConfig> = ( currentConfig: ControllerConfig, newValue: ControllerConfig[T], ctrl_id: number ) => void;

export interface ControllerRowData extends RowDataPacket , Controlador {}
// ==================== CONTROLLER END ====================


// ==================== GENERAL ====================

export interface GeneralConfig {
    COMPANY_NAME: string;
    EMAIL_ADMIN: string;
}

export interface GeneralConfigRowData extends RowDataPacket, GeneralConfig {};

export type GeneralUpdateFunction<T extends keyof GeneralConfig> = ( currentConfig: GeneralConfig, newValue: GeneralConfig[T] ) => void;

// ==================== GENERAL END ====================


// ==================== SYSTEM ====================
export interface SystemConfig extends ControllerConfig, GeneralConfig {}
// ==================== SYSTEM END ====================


// ==================== RESOLUTION ====================
export interface ResolucionRowData extends RowDataPacket, Resolucion {}
