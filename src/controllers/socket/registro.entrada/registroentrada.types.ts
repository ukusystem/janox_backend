import { Namespace, Socket } from 'socket.io';
import { RegistroEntrada, EquipoEntrada } from '../../../types/db';
import { RowDataPacket } from 'mysql2';

export type RegistroEntradaDTO = Omit<RegistroEntrada, 'rentd_id'>;
export type RegistroEntradaAddDTO = {
  pin: number;
  estado: number;
  ee_id?: number;
  fecha: string;
};

export type RegistroEntradaSocketDTO = Omit<RegistroEntrada, 'rentd_id'> & { equipoEntrada?: EquipoEntrada };

export interface RegistroEntradaRowData extends RowDataPacket, RegistroEntrada {}

export interface RegistroEntradaObserver {
  addRegistroAcceso(data: RegistroEntradaSocketDTO): void;
}

export interface RegistroEntradaSubject {
  registerObserver(ctrl_id: number, new_observer: RegistroEntradaObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyAddRegistroEntrada(ctrl_id: number, data: RegistroEntradaDTO): void;
}

export type MapRegistroEntrada = Map<number, RegistroEntradaDTO[]>; // key: ctrl_id
export type MapObseverRegEnt = Map<number, RegistroEntradaObserver>; // key:ctrl_id

// Socket types

interface ClientToServerEvents {}

interface ServerToClientEvents {
  list_registros_entrada: (listRegEntr: RegistroEntradaSocketDTO[]) => void;
  new_registro_entrada: (regEnt: RegistroEntradaSocketDTO) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceRegistroEntrada = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketRegistroEntrada = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
