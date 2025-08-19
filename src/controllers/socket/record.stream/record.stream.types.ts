import fs from 'fs';
import { ChildProcessByStdio } from 'child_process';
import { Namespace, Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CamRecordMap = Map<number, [ChildProcessByStdio<null, any, null>, fs.WriteStream]>; // key : cmr_id

export type ControllerRecordMap = Map<number, CamRecordMap>; // key : ctrl_id

// observer
export interface RecordStreamObserver {
  updateRecordState(data: boolean): void;
}

export interface RecordStreamSubject {
  registerObserver(ctrl_id: number, cmr_id: number, new_observer: RecordStreamObserver): void;
  unregisterObserver(ctrl_id: number, cmr_id: number): void;
  notifyRecordState(ctrl_id: number, cmr_id: number, data: boolean): void;
}

export type RecordObserverMap = Map<number, RecordStreamObserver>; // key : cmr_id
export type ControllerRecordObserverMap = Map<number, RecordObserverMap>; // key : ctrl_id

// socket
interface ClientToServerEvents {
  start_recording: (ctrl_id: number, cmr_id: number, time_seconds: number) => void;
  stop_recording: (ctrl_id: number, cmr_id: number) => void;
}

interface ServerToClientEvents {
  stream_is_recording: (state: boolean) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceRecordStream = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketRecordStream = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
