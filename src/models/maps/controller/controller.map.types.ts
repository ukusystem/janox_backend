import { RowDataPacket } from "mysql2";
import { Controlador, Resolucion } from "../../../types/db";

export type ControllerData = Controlador

export enum ControllerState {
  Activo = 1,
  Desactivado = 0,
}

export interface ControllerAndResolution {
  controller: Controlador;
  resolution: {
    motion_record: Resolucion;
    motion_snapshot: Resolucion;
    stream_aux: Resolucion;
    stream_pri: Resolucion;
    stream_sec: Resolucion;
  };
}

export interface ControllerResolution {

}

export type UpdateControllerResolution = Partial<
  Pick<
    Controlador,
    | "res_id_motionrecord"
    | "res_id_motionsnapshot"
    | "res_id_streamauxiliary"
    | "res_id_streamprimary"
    | "res_id_streamsecondary"
  >
>;

export interface ControllerRowData extends RowDataPacket , ControllerData {}
