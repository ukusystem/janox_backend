import { Namespace, Socket } from 'socket.io';
import { Personal, RegistroAcceso } from '../../../types/db';
import { RowDataPacket } from 'mysql2';

export type RegistroAccesoDTO = Omit<RegistroAcceso, 'ra_id'>;

export type RegistroAccesoSocketDTO = Omit<RegistroAcceso, 'ra_id'> & { personal?: Personal };

export interface RegistroAccesoRowData extends RowDataPacket, RegistroAcceso {}

export interface RegistroAccesoObserver {
  addRegistroAcceso(data: RegistroAccesoSocketDTO): void;
}

export interface RegistroAccesoSubject {
  registerObserver(ctrl_id: number, new_observer: RegistroAccesoObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyAddRegistroAcceso(ctrl_id: number, data: RegistroAccesoDTO): void;
}

export type MapRegistroAcceso = Map<number, RegistroAccesoDTO[]>; // key: ctrl_id
export type MapObseverRegAcc = Map<number, RegistroAccesoObserver>; // key:ctrl_id

// Socket types

interface ClientToServerEvents {}

interface ServerToClientEvents {
  list_registros_acceso: (listRegAcc: RegistroAccesoSocketDTO[]) => void;
  new_registro_acceso: (regAcc: RegistroAccesoSocketDTO) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceRegistroAcceso = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketRegistroAcceso = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
