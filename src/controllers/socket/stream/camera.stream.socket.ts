import { Server, Socket } from 'socket.io';
import { CamStreamDirection, CamStreamQuality } from './camera.stream.types';
import { CamStreamSocketManager, CamStreamSocketObserver } from './camera.stream.manager';
import { camStreamSocketSchema } from './camera.stream.schema';
import { vmsLogger } from '../../../services/loggers';

export const camStreamSocket = async (io: Server, socket: Socket) => {
  // Obtener ip y calidad
  const nspStream = socket.nsp;
  const [, , xctrl_id, xcmr_id, xq] = nspStream.name.split('/'); // Namespace : "/stream/nodo_id/camp_ip/calidad"

  // Validar
  const result = camStreamSocketSchema.safeParse({ ctrl_id: xctrl_id, cmr_id: xcmr_id, q: xq });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const validatedNsp = result.data;
  const direction: CamStreamDirection = { ctrl_id: validatedNsp.ctrl_id, cmr_id: validatedNsp.cmr_id, q: validatedNsp.q as CamStreamQuality };
  const { ctrl_id, cmr_id, q } = direction;

  vmsLogger.info(`Camera Stream Socket | Cliente ID: ${socket.id} | Petición Stream`, { ctrl_id, ip: cmr_id, q });

  CamStreamSocketManager.createProccess(direction);

  const observer = new CamStreamSocketObserver(socket);
  CamStreamSocketManager.registerObserver(direction, observer);

  // Manejar cierre de conexión
  socket.on('disconnect', () => {
    vmsLogger.info(`Camera Stream Socket | Cliente desconectado ID: ${socket.id}`, { ctrl_id, ip: cmr_id, q });
    const clientsCount = io.of(`/stream/${ctrl_id}/${cmr_id}/${q}`).sockets.size;
    vmsLogger.info(`Camera Stream Socket | Numero de clientes conectados: ${clientsCount} | ctrl_id: ${ctrl_id}, cmr_id: ${cmr_id}, q:${q}`);
    if (clientsCount === 0) {
      CamStreamSocketManager.killProcess(direction);
    }
  });

  // Manejar errores
  socket.on('error', (error) => {
    vmsLogger.error(`Camera Stream Socket | Error en la conexión Socket.IO: ${error.message}`, { ctrl_id, ip: cmr_id, q });
  });
};
