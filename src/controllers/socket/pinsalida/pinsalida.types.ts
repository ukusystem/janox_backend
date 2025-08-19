import { Namespace, Socket } from 'socket.io';
import { EquipoSalida, PinesSalida } from '../../../types/db';
import { RowDataPacket } from 'mysql2';

export enum ActionPinSal {
  Automatico = 0,
  Activar = 1,
  Desactivar = -1,
}

export interface OrdenPinSalida {
  action: ActionPinSal;
  ctrl_id: number;
  pin: number;
  ps_id: number;
  es_id: number;
}

export interface ResponseOrdenPinSalida {
  success: boolean;
  message: string;
  ordenSend: OrdenPinSalida;
}

// export type IPinSalidaSocket = PinesSalida & Pick<Controlador, "ctrl_id"> & { automatico: boolean; orden: ActionPinSal };

export type PinSalidaDTO = PinesSalida & {
  automatico: boolean;
  orden: ActionPinSal;
};

export type PinSalidaSocketDTO = PinSalidaDTO;

export type PinSalidaAddUpdateDTO = {
  ps_id: number;
  pin: number;
  es_id: number | undefined;
  descripcion: string | undefined;
  estado: number | undefined;
  activo: number | undefined;

  automatico: boolean;
  orden: ActionPinSal | undefined;
  shouldNotify?: boolean;
};

export interface PinSalidaRowData extends RowDataPacket, PinesSalida {}

export type MapPinSalida = Map<number, PinSalidaDTO>; // key : ps_id;
export type MapControladorPinSalida = Map<number, MapPinSalida>; // key: ctrl_id

export interface PinSalidaObserver {
  updateEquiposSalida(data: EquipoSalida[]): void;
  updateListPinesSalida(data: PinSalidaSocketDTO[], equipo_salida: EquipoSalida): void;
  updateItemPinSalida(data: PinSalidaSocketDTO): void;
}

export type MapObserverPinSalida = Map<number, PinSalidaObserver>; // key: ctrl_id

export interface PinesSalidaSubject {
  registerObserver(ctrl_id: number, new_observer: PinSalidaObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyEquiposSalida(ctrl_id: number, data: EquipoSalida[]): void;
  notifyListPinesSalida(ctrl_id: number, pin_salida: PinSalidaDTO): void;
  notifyItemPinSalida(ctrl_id: number, pin_salida: PinSalidaDTO): void;
}

// Socket

interface ClientToServerEvents {
  initial_list_pines_salida: (es_id: number) => void;
  initial_item_pin_salida: (ps_id: number) => void;
  orden_pin_salida: (data: OrdenPinSalida) => void;
}

interface ServerToClientEvents {
  equipos_salida: (equiSal: EquipoSalida[]) => void;
  item_pin_salida: (pinSal: PinSalidaDTO) => void;
  list_pines_salida: (lisPinSal: PinSalidaDTO[], equiSal: EquipoSalida) => void;
  response_orden_pin_salida: (data: ResponseOrdenPinSalida) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespacePinSalida = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketPinSalida = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
