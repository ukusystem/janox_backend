import { Camara } from '../../../types/db';
import { DataStruct } from './dataStruct';

export type IntConsumer = ((code: number, data?: DataStruct) => void) | null;
export type LoadedFile = { ruta: string; nombreoriginal: string; tipo: string; tamaño: number; thumbnail: string | null };
export type PinOrder = { action: number; ctrl_id: number; pin: number; remoteAccess?: boolean };

export class CameraToCheck {
  readonly nodeID: number;
  readonly camara: Camara;
  checkedIn: boolean = false;
  errorNotified: boolean = false;

  constructor(nodeID: number, camara: Camara) {
    this.nodeID = nodeID;
    this.camara = camara;
  }
}

/**
 * COM port data read from OS
 */
export interface ComData {
  path: string;
  name: string;
}
