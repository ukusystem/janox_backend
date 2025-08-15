import { Server } from 'socket.io';
import { SocketControllerState } from './controller.state.types';
import { controllerStateSocketSchema } from './controller.state.schema';
import { ControllerStateManager, ControllerStateSocketObserver } from './controller.state.manager';
import { ControllerMapManager } from '../../../models/maps';
import { sendSecurity } from '../../../models/controllerapp/controller';
import * as codes from '../../../models/controllerapp/src/codes';

export const contollerStateSocket = async (io: Server, socket: SocketControllerState) => {
  const nspControllerState = socket.nsp;
  const [, , xctrl_id] = nspControllerState.name.split('/'); // Namespace: "/controller_state/ctrl_id"

  // Validar
  const result = controllerStateSocketSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.emit('error_message', { message: `Ocurrio un error al validar el controlador` });
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const controller = ControllerStateManager.getController(ctrl_id);

  if (controller === undefined) {
    socket.emit('error_message', { message: `Controlador no disponible` });
    socket.disconnect(true);
    return;
  }

  socket.emit('controller_info', controller);

  const observer = new ControllerStateSocketObserver(socket);
  ControllerStateManager.registerObserver(ctrl_id, observer);

  socket.on('setSecurity', async (newSecurity) => {
    const res = await sendSecurity(ctrl_id, newSecurity === 1);
    if (res && res.resultado) {
      if (res.codigo === codes.VALUE_ARM || res.codigo === codes.VALUE_DISARM) {
        ControllerMapManager.update(ctrl_id, { seguridad: res.codigo === codes.VALUE_ARM ? 1 : 0 });
      } else {
        console.log(`Response is not a final state 0x${res.codigo.toString(16)}`);
      }
    } else {
      // 'No response or false'
    }

    // if(res !== undefined && res.mensaje){
    //   // socket.emit("some_event",{message:res.mensaje});
    // }
  });

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/controller_state/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      ControllerStateManager.unregisterObserver(ctrl_id);
    }
  });
};
