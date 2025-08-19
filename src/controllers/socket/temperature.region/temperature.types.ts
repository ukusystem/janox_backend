import { Namespace, Socket } from 'socket.io';
import { Region, SensorTemperatura } from '../../../types/db';

export type TemperatureActionType = 'add' | 'update' | 'delete';

export interface ControllerDataTemperature {
  ctrl_id: number;
  nodo: string;
  rgn_id: number;
  descripcion: string;
  seguridad: 0 | 1;
  conectado: 0 | 1;
  modo: 0 | 1;
  activo: 0 | 1;
  direccion: string;
}

export type TemperatureSocketDTO = SensorTemperatura;

export interface InitialDataTemperature {
  [ctrl_id: number]: {
    controlador: ControllerDataTemperature;
    sensor_temperature: TemperatureSocketDTO[];
  };
}

// Observer:
export interface TemperatureObserver {
  emitTemperature(ctrl_id: number, data: TemperatureSocketDTO, action: TemperatureActionType): void;
  emitController(ctrl_id: number, data: ControllerDataTemperature, action: TemperatureActionType): void;
  emitRegion(rgn_id: number, data: Region, action: TemperatureActionType): void;
}

export interface TemperatureSubject {
  registerObserver(new_observer: TemperatureObserver): void;
  unregisterObserver(): void;
  notifyTemperature(ctrl_id: number, data: TemperatureSocketDTO, action: TemperatureActionType): void;
  notifyController(ctrl_id: number, action: TemperatureActionType): void;
  notifyRegion(rgn_id: number, action: TemperatureActionType): void;
}

// Socket :
interface ClientToServerEvents {}

interface ServerToClientEvents {
  initial_data: (data: InitialDataTemperature, regions: Region[]) => void;
  temperature: (ctrl_id: number, data: TemperatureSocketDTO, action: TemperatureActionType) => void;
  controller: (ctrl_id: number, data: ControllerDataTemperature, action: TemperatureActionType) => void;
  region: (rgn_id: number, data: Region, action: TemperatureActionType) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceTemperature = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketTemperature = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
