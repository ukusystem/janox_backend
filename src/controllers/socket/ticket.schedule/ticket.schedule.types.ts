import { Namespace, Socket } from 'socket.io';

export enum RegTicketState {
  Esperando = 1,
  Aceptado = 2,
  Cancelado = 3,
  Rechazado = 4,
  Finalizado = 16,
  Anulado = 17,
  NoAtendido = 18,
}

export type TicketAction = 'add' | 'update' | 'delete';

export interface RegistroTicketObj {
  rt_id: number;
  telefono: string;
  correo: string;
  descripcion: string;
  fechacomienzo: number;
  fechatermino: number;
  prioridad: number;
  p_id: number;
  tt_id: number;
  sn_id: number;
  co_id: number;
  estd_id: number;
  // ctrl_id: number;
}

export type RegTicketCronContext = RegistroTicketObj & { ctrl_id: number };

export type RegTicketSocketDTO = RegistroTicketObj & { ctrl_id: number };

export interface RegistroTicketJobSchedule {
  stop(): void;
  start(): void;
}

export interface RegistroTicketSchedule {
  ticket: RegistroTicketObj;
  startSchedule?: RegistroTicketJobSchedule;
  endSchedule?: RegistroTicketJobSchedule;
}

export type RegistroTicketMap = Map<number, RegistroTicketSchedule>; // key : rt_id
export type ControllerRegTicketMap = Map<number, RegistroTicketMap>; // key : ctrl_id

// Observer:
export interface RegistroTicketObserver {
  updateRegistroTicket(data: RegTicketSocketDTO, type: TicketAction): void;
}

export interface RegistroTicketSubject {
  registerObserver(ctrl_id: number, new_observer: RegistroTicketObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyRegistroTicket(ctrl_id: number, data: RegistroTicketObj, type: TicketAction): void;
}

export type ObserverRegTicketMap = Map<number, RegistroTicketObserver>; // key : ctrl_id

// Socket :
interface ClientToServerEvents {}

interface ServerToClientEvents {
  add_ticket: (data: RegTicketSocketDTO) => void;
  update_ticket: (data: RegTicketSocketDTO) => void;
  delete_ticket: (data: RegTicketSocketDTO) => void;
  tickets: (data: RegTicketSocketDTO[]) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceTicketSchedule = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketTicketSchedule = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
