import { Server } from 'socket.io';
import { LastSnapShotManager, LastSnapshotSocketObserver } from './last.snapshot.manager';
import { SocketLastSnapshot } from './last.snapshot.types';
import { lastSnapshotNamespaceSchema } from './last.snapshot.schema';
import { genericLogger } from '../../../services/loggers';

export const lastSnapshotSocket = async (io: Server, socket: SocketLastSnapshot) => {
  const nspLastSnapshot = socket.nsp;
  const [, , xctrl_id] = nspLastSnapshot.name.split('/'); // Namespace : "/last_snapshot/ctrl_id"

  const result = lastSnapshotNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const newObserver = new LastSnapshotSocketObserver(socket);
  LastSnapShotManager.registerObserver(ctrl_id, newObserver);

  // emit initial data
  if (LastSnapShotManager.snapshot[ctrl_id]) {
    socket.emit('last_snapshot', LastSnapShotManager.snapshot[ctrl_id]);
  }

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/last_snapshot/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      LastSnapShotManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Error en el namespace last snapshot | ctrl_id = ${ctrl_id}`, error);
  });
};
