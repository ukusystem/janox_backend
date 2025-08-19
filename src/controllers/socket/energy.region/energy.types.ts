import { Namespace, Socket } from 'socket.io';
import { MedidorEnergia, Region } from '../../../types/db';

export type EnergyActionType = 'add' | 'update' | 'delete';

export interface ControllerDataEnergy {
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

export type EnergySocketDTO = Omit<MedidorEnergia, 'serie'>;

export interface InitialDataEnergy {
  [ctrl_id: number]: {
    controlador: ControllerDataEnergy;
    module_energy: EnergySocketDTO[];
  };
}

// Observer:
export interface EnergyObserver {
  emitEnergy(ctrl_id: number, data: EnergySocketDTO, action: EnergyActionType): void;
  emitController(ctrl_id: number, data: ControllerDataEnergy, action: EnergyActionType): void;
  emitRegion(rgn_id: number, data: Region, action: EnergyActionType): void;
}

export interface EnergySubject {
  registerObserver(new_observer: EnergyObserver): void;
  unregisterObserver(): void;
  notifyEnergy(ctrl_id: number, data: EnergySocketDTO, action: EnergyActionType): void;
  notifyController(ctrl_id: number, action: EnergyActionType): void;
  notifyRegion(rgn_id: number, action: EnergyActionType): void;
}

// Socket :
interface ClientToServerEvents {}

interface ServerToClientEvents {
  initial_data: (data: InitialDataEnergy, regions: Region[]) => void;
  energy: (ctrl_id: number, data: EnergySocketDTO, action: EnergyActionType) => void;
  controller: (ctrl_id: number, data: ControllerDataEnergy, action: EnergyActionType) => void;
  region: (rgn_id: number, data: Region, action: EnergyActionType) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceEnergy = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketEnergy = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
