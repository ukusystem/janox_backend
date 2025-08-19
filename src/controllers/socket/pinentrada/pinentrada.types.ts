import { Namespace, Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2';

export type PinEntradaDTO = {
  pe_id: number;
  pin: number;
  ee_id: number;
  descripcion: string;
  estado: number;
  activo: number;
};
// export type PinEntradaSocketDTO = PinesEntrada & Pick<Controlador, 'ctrl_id'>;
export type PinEntradaSocketDTO = PinEntradaDTO;
export type PinEntradaAddUpdateDTO = {
  pe_id: number;
  pin: number;
  ee_id: number | undefined;
  descripcion: string | undefined;
  estado: number | undefined;
  activo: number | undefined;
};

export type MapPinEntrada = Map<number, PinEntradaDTO>; // key : pe_id;
export type MapControladorPinEntrada = Map<number, MapPinEntrada>; // key: ctrl_id

export interface PinEntradaDTORowData extends RowDataPacket, PinEntradaDTO {}

// Observers

export interface PinesEntradaObserver {
  updateListPinesEntrada(data: PinEntradaSocketDTO[]): void;
  updateItemPinEntrada(data: PinEntradaSocketDTO): void;
  updateControllerMode(data: 0 | 1): void;
  updateControllerSecurity(data: 0 | 1): void;
}

export type MapObserverPinEntrada = Map<number, PinesEntradaObserver>; // key: ctrl_id

export interface PinesEntradaSubject {
  registerObserver(ctrl_id: number, new_observer: PinesEntradaObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyListPinesEntrada(ctrl_id: number, data: PinEntradaDTO): void;
  notifyItemPinEntrada(ctrl_id: number, data: PinEntradaDTO): void;
  notifyControllerMode(ctrl_id: number, data: 0 | 1): void;
  notifyControllerSecurity(ctrl_id: number, data: 0 | 1): void;
}

// Socket types

interface ClientToServerEvents {}

interface ServerToClientEvents {
  list_pines_entrada: (data: PinEntradaSocketDTO[]) => void;
  item_pin_entrada: (data: PinEntradaSocketDTO) => void;
  controller_mode: (data: 0 | 1) => void;
  controller_security: (data: 0 | 1) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespacePinEntrada = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketPinEntrada = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
