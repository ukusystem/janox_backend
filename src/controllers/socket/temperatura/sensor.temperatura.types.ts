import { Namespace, Socket } from 'socket.io';
import { SensorTemperatura } from '../../../types/db';
import { RowDataPacket } from 'mysql2';

export type SenTempAction = 'add' | 'delete' | 'update';

export enum SenTempState {
  Activo = 1,
  Desactivado = 0,
}

export type SenTemperarturaObj = SensorTemperatura;
export type SenTemperaturaSocketDTO = SenTemperarturaObj;

export interface SenTemperaturaAddUpdateDTO {
  st_id: number;
  serie: string | undefined;
  ubicacion: string | undefined;
  actual: number | undefined;
  activo: number | undefined;
  umbral_alarma: number | undefined;
}

export interface NotifyMaxTemperatureDTO {
  ctrl_id: number;
  st_id: number;
  value: number;
  datetime: string;
}

export interface SensorTemperaturaRowData extends RowDataPacket, SensorTemperatura {}

export type SenTemperaturaMap = Map<number, SenTemperarturaObj>; // key : me_id
export type ControllerSenTempMap = Map<number, SenTemperaturaMap>; // key : ctrl_id

// Observer:
export interface SensorTemperaturaObserver {
  updateListSenTemp(data: SenTemperaturaSocketDTO, action: SenTempAction): void;
  updateSenTemp(data: SenTemperaturaSocketDTO): void;
}

export interface SensorTemperaturaSubject {
  registerObserver(ctrl_id: number, new_observer: SensorTemperaturaObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyListSenTemp(ctrl_id: number, data: SenTemperarturaObj, action: SenTempAction): void;
  notifySenTemp(ctrl_id: number, data: SenTemperarturaObj): void;
}

export type ObserverSenTempMap = Map<number, SensorTemperaturaObserver>; // key : ctrl_id

// Socket :
interface ClientToServerEvents {}

interface ServerToClientEvents {
  initial_list_temperature: (list: SenTemperaturaSocketDTO[]) => void;
  list_temperature: (modEn: SenTemperaturaSocketDTO, action: SenTempAction) => void;
  temperature: (modEn: SenTemperaturaSocketDTO) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceSenTemperatura = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketSenTemperatura = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
