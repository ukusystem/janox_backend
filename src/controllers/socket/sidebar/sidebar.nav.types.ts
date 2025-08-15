import { Namespace, Socket } from 'socket.io';
import { Controlador, Region } from '../../../types/db';

export type SidebarNavControllerData = Pick<Controlador, 'rgn_id' | 'ctrl_id' | 'nodo' | 'activo' | 'conectado' | 'seguridad' | 'modo' | 'descripcion'> & Pick<Region, 'region'>;

export interface ErrorSidebarNav {
  message: string;
}

// socket
interface ClientToServerEvents {}

interface ServerToClientEvents {
  controllers: (controllers: SidebarNavControllerData[]) => void;
  update_controller: (controller: SidebarNavControllerData) => void;
  add_controller: (newController: SidebarNavControllerData) => void;
  message_error: (data: ErrorSidebarNav) => void;
  update_region: (region: Region) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceSidebarNav = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketSidebarNav = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

// Observer
export interface SidebarNavObserver {
  updateController(controller: SidebarNavControllerData): void;
  addController(newController: SidebarNavControllerData): void;
  updateRegion(region: Region): void;
}

export interface SidebarNavSubject {
  registerObserver(observer: SidebarNavObserver): void;
  unregisterObserver(): void;
  notifyAddController(ctrl_id: number): void;
  notifyUpdateController(ctrl_id: number): void;
  notifyUpdateRegion(rgn_id: number): void;
}
