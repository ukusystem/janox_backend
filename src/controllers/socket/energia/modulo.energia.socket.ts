import { Server } from 'socket.io';
import { SocketMedEnergia } from './modulo.energia.types';
import { medEnerNamespaceSchema } from './modulo.energia.schema';
import { MedidorEnergiaManager, ModuloEnergiaObserver } from './modulo.energia.manager';
import { genericLogger } from '../../../services/loggers';

export const medEnergiaSocket = async (io: Server, socket: SocketMedEnergia) => {
  const nspModEn = socket.nsp;
  const [, , xctrl_id] = nspModEn.name.split('/'); // Namespace : "/modulo_enegia/ctrl_id"

  const result = medEnerNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const observer = new ModuloEnergiaObserver(socket);
  MedidorEnergiaManager.registerObserver(ctrl_id, observer);

  const data = MedidorEnergiaManager.getListMedEnergia(ctrl_id);
  socket.emit('initial_list_energia', data);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/modulo_enegia/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      MedidorEnergiaManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Error en el namespace de modulos de energia | ${ctrl_id}`, error);
  });
};
