import { Server } from 'socket.io';
import { SocketRegistroEntrada, RegistroEntradaSocketDTO } from './registroentrada.types';
import { RegistroEntradaManager, RegistroEntradaSocketObserver } from './registroentrada.manager';
import { EquipoEntradaMapManager } from '../../../models/maps';
import { genericLogger } from '../../../services/loggers';
import { regEntSchema } from './registroentrada.schema';

export const registroEntradaSocket = async (io: Server, socket: SocketRegistroEntrada) => {
  const nspRegEnt = socket.nsp;
  const [, , xctrl_id] = nspRegEnt.name.split('/'); // Namespace : "/registro_entrada/ctrl_id"

  const result = regEntSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  // register observer
  const newObserver = new RegistroEntradaSocketObserver(socket);
  RegistroEntradaManager.registerObserver(ctrl_id, newObserver);
  // emit initial data:
  const regEntradas = RegistroEntradaManager.getRegistrosCtrl(ctrl_id);
  const regEntSocket = regEntradas.map<RegistroEntradaSocketDTO>((regEnt) => {
    const equEnt = EquipoEntradaMapManager.getEquipoEntrada(regEnt.ee_id);
    return { ...regEnt, equipoEntrada: equEnt };
  });

  socket.emit('list_registros_entrada', regEntSocket);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/registro_entrada/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      RegistroEntradaManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Socket Registro Entrada | Error | ctrl_id = ${ctrl_id}`, error);
  });
};
