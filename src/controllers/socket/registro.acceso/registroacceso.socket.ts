import { Server } from 'socket.io';
import { SocketRegistroAcceso, RegistroAccesoSocketDTO } from './registroacceso.types';
import { RegistroAccesoManager, RegistroAccesoSocketObserver } from './registroacceso.manager';
import { PersonalMapManager } from '../../../models/maps';
import { genericLogger } from '../../../services/loggers';
import { regAccSchema } from './registroacceso.schema';

export const registroAccesoSocket = async (io: Server, socket: SocketRegistroAcceso) => {
  const nspRegAcc = socket.nsp;
  const [, , xctrl_id] = nspRegAcc.name.split('/'); // Namespace : "/registro_acceso/ctrl_id"

  const result = regAccSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  // register observer
  const newObserver = new RegistroAccesoSocketObserver(socket);
  RegistroAccesoManager.registerObserver(ctrl_id, newObserver);
  // emit initial data:
  const regAccesos = RegistroAccesoManager.getRegistrosCtrl(ctrl_id);
  const regAccSocket = regAccesos.map<RegistroAccesoSocketDTO>((regAcc) => {
    const personal = PersonalMapManager.getPersonal(regAcc.p_id);
    return { ...regAcc, personal: personal };
  });

  socket.emit('list_registros_acceso', regAccSocket);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/registro_acceso/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      RegistroAccesoManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Socket Registro Acceso | Error | ctrl_id = ${ctrl_id}`, error);
  });
};
