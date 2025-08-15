import { Namespace, Socket } from 'socket.io';
import { MedidorEnergia } from '../../../types/db';
import { RowDataPacket } from 'mysql2';

export type MedEneListAction = 'add' | 'delete' | 'update';

export enum MedEneState {
  Activo = 1,
  Desactivado = 0,
}

export type MedEnergiaObj = Omit<MedidorEnergia, 'serie'>;
export type MedEnergiaSocketDTO = MedEnergiaObj;

export interface MedEnergiaAddUpdateDTO {
  me_id: number;
  descripcion: string | undefined;
  voltaje: number | undefined;
  amperaje: number | undefined;
  fdp: number | undefined;
  frecuencia: number | undefined;
  potenciaw: number | undefined;
  potenciakwh: number | undefined;
  activo: number | undefined;
}
export interface MedidorEnergiaRowData extends RowDataPacket, MedidorEnergia {}

export type MedEnergiaMap = Map<number, MedEnergiaObj>; // key : me_id
export type CtrlMedEnergiaMap = Map<number, MedEnergiaMap>; // key : ctrl_id

// Observer:
export interface MedEnergiaObserver {
  updateListModEnergia(data: MedEnergiaSocketDTO, action: MedEneListAction): void;
  updateModEnergia(data: MedEnergiaSocketDTO): void;
}

export type ObserverMedEnergiaMap = Map<number, MedEnergiaObserver>; // key : ctrl_id

export interface ModEnergiaSubject {
  registerObserver(ctrl_id: number, new_observer: MedEnergiaObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyListMedEnergia(ctrl_id: number, data: MedEnergiaSocketDTO, action: MedEneListAction): void;
  notifyMedEnergia(ctrl_id: number, data: MedEnergiaSocketDTO): void;
}

// Socket:
interface ClientToServerEvents {}

interface ServerToClientEvents {
  initial_list_energia: (list: MedEnergiaSocketDTO[]) => void;
  list_energia: (modEn: MedEnergiaSocketDTO, action: MedEneListAction) => void;
  energia: (modEn: MedEnergiaSocketDTO) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceMedEnergia = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketMedEnergia = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
