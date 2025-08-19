import { Server } from 'socket.io';
import { PinEntradaManager, PinesSalidaSocketObserver } from './pinentrada.manager';
import { ControllerMapManager } from '../../../models/maps';
import { genericLogger } from '../../../services/loggers';
import { pinEntSchema } from './pinentrada.schema';
import { SocketPinEntrada } from './pinentrada.types';

export const pinEntradaSocket = async (io: Server, socket: SocketPinEntrada) => {
  const nspEnergia = socket.nsp;
  const [, , xctrl_id] = nspEnergia.name.split('/'); // Namespace : "/pin_entrada/ctrl_id"

  const result = pinEntSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const observer = new PinesSalidaSocketObserver(socket);
  PinEntradaManager.registerObserver(Number(ctrl_id), observer);
  //emit initial data:
  const data = PinEntradaManager.getListPinesEntrada(ctrl_id);

  socket.emit('list_pines_entrada', data);

  try {
    const controller = ControllerMapManager.getController(ctrl_id);
    if (controller === undefined) {
      throw new Error(`Controlador ${ctrl_id} no encontrado.`);
    }
    socket.emit('controller_mode', controller.modo);
    socket.emit('controller_security', controller.seguridad);
  } catch (error) {
    genericLogger.error(`Socket Pines Entrada | Error al obtener modo y seguridad | ctrl_id = ${ctrl_id}`, error);
  }

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/pin_entrada/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      PinEntradaManager.unregisterObserver(Number(ctrl_id));
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Error en el namespace pines entrada | ${ctrl_id}`, error);
  });
};
