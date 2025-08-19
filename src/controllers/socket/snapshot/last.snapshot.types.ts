import { Namespace, Socket } from 'socket.io';

// Observer:
export interface LastSnapshotObserver {
  updateLastSnapshot(data: string): void;
}

export interface LastSnapshotSubject {
  registerObserver(ctrl_id: number, observer: LastSnapshotObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyLastSnapshot(ctrl_id: number, data: string): void;
}

// Socket:
interface ClientToServerEvents {}

interface ServerToClientEvents {
  last_snapshot: (img: string) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceLastSnapshot = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export type SocketLastSnapshot = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
