import { Socket, Namespace } from 'socket.io';
import { ControllerConfig, ControllerMode, ControllerSecurity } from '../../../models/system';
import { Controlador, Region } from '../../../types/db';

export type KeyControllerConfig = keyof ControllerConfig;

export interface ErrorControllerState {
  message: string;
}

export interface NewStatesController {
  disableSecurityButton?: boolean;
}
export type ControllerStateInfo = Pick<Controlador, 'ctrl_id' | 'nodo' | 'rgn_id' | 'descripcion' | 'seguridad' | 'modo' | 'conectado' | 'activo'> & Pick<Region, 'region'> & Pick<NewStatesController, 'disableSecurityButton'>;

export type NewStateControllerMap = Map<number, NewStatesController>; // key : ctrl_id

// Observer
export interface ControllerStateObserver {
  updateController(newCtrl: ControllerStateInfo): void;
  updateRegion(region: Region): void;
  updateSecurityButton(data: boolean): void;
}

export interface ControllerStateSubject {
  registerObserver(ctrl_id: number, observer: ControllerStateObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyUpdateController(ctrl_id: number): void;
  notifyUpdateRegion(rgn_id: number): void;
  notifyUpdateSecurityButton(ctrl_id: number, data: boolean): void;
}

// socket
interface ClientToServerEvents {
  setMode: (newMode: ControllerMode) => void;
  setSecurity: (newSecurity: ControllerSecurity) => void;
}

interface ServerToClientEvents {
  controller_info: (data: ControllerStateInfo) => void;
  error_message: (data: ErrorControllerState) => void;
  update_controller: (data: ControllerStateInfo) => void;
  update_region: (data: Region) => void;
  update_security_button: (data: boolean) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceControllerState = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketControllerState = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
