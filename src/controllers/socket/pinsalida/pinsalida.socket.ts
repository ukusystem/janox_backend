import { Server } from 'socket.io';
import { SocketPinSalida } from './pinsalida.types';
import { PinSalidaManager, PinSalidaSocketObserver } from './pinsalida.manager';
import { pinSalNamespaceSchema } from './pinsalida.schema';
import { onOrder } from '../../../models/controllerapp/controller';
import { genericLogger } from '../../../services/loggers';
import { EquipoSalidaMapManager } from '../../../models/maps';

export const pinSalidaSocket = async (io: Server, socket: SocketPinSalida) => {
  const nspPinSal = socket.nsp;
  const [, , xctrl_id] = nspPinSal.name.split('/'); // Namespace : "/pines_salida/ctrl_id"

  const result = pinSalNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const observer = new PinSalidaSocketObserver(socket);
  PinSalidaManager.registerObserver(ctrl_id, observer);

  const newEquipSal = PinSalidaManager.getListEquiposSalida(ctrl_id);
  // posible add filter for es_id armado
  socket.emit('equipos_salida', newEquipSal);

  socket.on('initial_list_pines_salida', (es_id) => {
    const equiSal = EquipoSalidaMapManager.getEquipoSalida(es_id);
    if (equiSal !== undefined) {
      const newListPinSal = PinSalidaManager.getListPinesSalida(ctrl_id, es_id);
      // posible add conditional for es_id armado
      socket.emit('list_pines_salida', newListPinSal, equiSal);
    }
  });

  socket.on('initial_item_pin_salida', (ps_id) => {
    const newItemPinSal = PinSalidaManager.getItemPinSalida(ctrl_id, ps_id);
    if (newItemPinSal !== undefined) {
      // posible add conditional for es_id armado
      socket.emit('item_pin_salida', newItemPinSal);
    }
  });

  socket.on('orden_pin_salida', async ({ action, ctrl_id, pin, es_id, ps_id }) => {
    genericLogger.info(`Socket Pines Salida | Orden | ctrl_id : ${ctrl_id} | action : ${action} | pin : ${pin}`, { action, pin, es_id });
    try {
      const isRemoteAccess = es_id === 22 && action === 1; // es_id(22: Acceso (Apertura de puerta) ) , action(1: ON)
      const ordenResult = await onOrder({ action, ctrl_id, pin, remoteAccess: isRemoteAccess });

      if (ordenResult === undefined) {
        return;
      }
      genericLogger.info(`Socket Pines Salida | Resultado Orden |  ${ordenResult.resultado ? 'Correcto' : 'Incorrecto'} | ${ordenResult.mensaje}`, ordenResult);

      if (!ordenResult.resultado) {
        socket.emit('response_orden_pin_salida', { success: ordenResult.resultado, message: ordenResult.mensaje, ordenSend: { action, ctrl_id, pin, es_id, ps_id } });
        return;
      }

      // orden correcto
      const currPinSal = PinSalidaManager.getItemPinSalida(ctrl_id, ps_id);
      if (currPinSal === undefined) {
        return;
      }

      PinSalidaManager.add_update(ctrl_id, { ...currPinSal, orden: action });
      socket.emit('response_orden_pin_salida', { success: ordenResult.resultado, message: ordenResult.mensaje, ordenSend: { action, ctrl_id, pin, es_id, ps_id } });
    } catch (error) {
      genericLogger.error(`Socket Pines Salida | Error Orden | ctrl_id = ${ctrl_id}`, error);
    }
  });

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/pines_salida/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      PinSalidaManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Error en el namespace pines de salida | ctrl_id = ${ctrl_id}`, error);
  });
};
