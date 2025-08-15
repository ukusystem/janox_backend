/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChildProcessByStdio } from 'child_process';
import { RowDataPacket } from 'mysql2';
import { Camara } from '../../../types/db';

export interface CameraMotionProps {
  ip: string;
  usuario: string;
  contraseña: string;
  cmr_id: number;
  ctrl_id: number;

  ffmpegProcess: ChildProcessByStdio<null, null, null> | undefined;
  isActiveMotion: boolean;
}

export interface CameraRowData extends RowDataPacket, Camara {}

export type CameraProps = Pick<CameraMotionProps, 'ip' | 'usuario' | 'contraseña' | 'cmr_id' | 'ctrl_id'>;

export interface CameraMotionMethods {
  receivedEvent: (camMessage: any, xml: any, rtspUrl: string) => void;
  stripNamespaces: (topic: any) => string;
  processEvent: (eventTime: any, eventTopic: any, eventProperty: any, sourceName: any, sourceValue: any, dataName: any, dataValue: any, rtspUrl: string) => void;
}
