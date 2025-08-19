import { RowDataPacket } from "mysql2";
import { ChildProcessByStdio } from "node:child_process";

export enum Day {
  "Monday" = 1,
  "Tuesday" = 2,
  "Wednesday" = 3,
  "Thursday" = 4,
  "Friday" = 5,
  "Saturday" = 6,
  "Sunday" = 7,
}

export interface NvrPreferencia {
  nvrpref_id: number;
  dia: Day;
  tiempo_inicio: string;
  tiempo_final: string;
  cmr_id: number;
  activo: number;
}

export interface NvrJobSchedule {
  stop(): void;
  start(): void;
}

export interface CameraJob {
  info: NvrPreferencia,
  startScheduledJob?:NvrJobSchedule,
  endScheduleJob?: NvrJobSchedule,
  ffmpegProcess?: ChildProcessByStdio<null, null, null>
  isRecording?:boolean
}

// export type CamaraEvents = Map<number, CameraJob>; // key: cmr_id
export type PreferenciaStructure = Map<number, CameraJob>; // key: nvrpref_id

export type NvrControllerStructure = Map<number, PreferenciaStructure>; // key: ctrl_id


export interface NvrPreferenciaRowData extends RowDataPacket, NvrPreferencia {};

export interface CronTimesNvr {
  cron_tiempo_inicio: string;
  cron_tiempo_final: string;
}

export interface SecondTimesNvr {
  start_time_seconds: number;
  end_time_seconds: number;
}

export type CronJobContext = NvrPreferencia & {ctrl_id:number}