import { LastSnapshotObserver, SocketLastSnapshot } from "./last.snapshot.types";

export class LastSnapshotSocketObserver implements LastSnapshotObserver {
  #socket: SocketLastSnapshot;

  constructor(socket: SocketLastSnapshot) {
    this.#socket = socket;
  }
  updateLastSnapshot(data: string): void {
    this.#socket.nsp.emit("last_snapshot", data);
  }
}

export class LastSnapShotManager  {
  static observers: { [ctrl_id: number]: LastSnapshotObserver } = {};
  static snapshot: { [ctrl_id: number]: string } = {};

  static registerObserver(ctrl_id: number, observer: LastSnapshotObserver): void {
    if (!LastSnapShotManager.observers[ctrl_id]) {
      LastSnapShotManager.observers[ctrl_id] = observer;
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    if (LastSnapShotManager.observers[ctrl_id]) {
      delete LastSnapShotManager.observers[ctrl_id];
    }
  }

  static notifyLastSnapshot(ctrl_id: number, data: string): void {
    LastSnapShotManager.snapshot[ctrl_id] = data;
    if (LastSnapShotManager.observers[ctrl_id]) {
      LastSnapShotManager.observers[ctrl_id].updateLastSnapshot(data);
    }
  }
}