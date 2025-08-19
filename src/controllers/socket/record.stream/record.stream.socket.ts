import { Server } from 'socket.io';

import { SocketRecordStream } from './record.stream.types';
import { recordStreamSchema } from './record.stream.schema';
import { RecordStreamManager, RecStreamSocketObserver } from './record.stream.manager';
import { vmsLogger } from '../../../services/loggers';

export const recordStreamSocket = async (_io: Server, socket: SocketRecordStream) => {
  const nspSenTemp = socket.nsp;
  const [, , xctrl_id, xcmr_id] = nspSenTemp.name.split('/'); // Namespace : "/record_stream/:ctrl_id/:cmr_id"

  const result = recordStreamSchema.safeParse({ ctrl_id: xctrl_id, cmr_id: xcmr_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id, cmr_id } = result.data;

  const observer = new RecStreamSocketObserver(socket);
  RecordStreamManager.registerObserver(ctrl_id, cmr_id, observer);

  socket.on('start_recording', async (ictrl_id, icmr_id, time_seconds) => {
    try {
      await RecordStreamManager.startRecord(ictrl_id, icmr_id, time_seconds);
    } catch (error) {
      vmsLogger.error(`Stream Record Socket | start_recording | Error | ctrl_id = ${ictrl_id} | ip = ${icmr_id}`, error);
      return;
    }
  });

  socket.on('stop_recording', (ictrl_id, icmr_id) => {
    RecordStreamManager.stopRecord(ictrl_id, icmr_id);
  });

  socket.on('error', (error) => {
    vmsLogger.error(`Stream Record Socket | Error | ctrl_id = ${ctrl_id} | ip = ${cmr_id}`, error);
  });
};
