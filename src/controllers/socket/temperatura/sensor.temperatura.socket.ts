import { Server } from 'socket.io';

import { senTempNamespaceSchema } from './sensor.temperatura.schema';
import { SensorTemperaturaManager, SenTempSocketObserver } from './sensor.temperatura.manager';
import { genericLogger } from '../../../services/loggers';
import { SocketSenTemperatura } from './sensor.temperatura.types';

export const senTemperaturaSocket = async (io: Server, socket: SocketSenTemperatura) => {
  const nspSenTemp = socket.nsp;
  const [, , xctrl_id] = nspSenTemp.name.split('/'); // Namespace : "/sensor_temperatura/ctrl_id"

  const result = senTempNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const observer = new SenTempSocketObserver(socket);
  SensorTemperaturaManager.registerObserver(ctrl_id, observer);

  const data = SensorTemperaturaManager.getListSenTemp(ctrl_id);
  socket.emit('initial_list_temperature', data);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/sensor_temperatura/${ctrl_id}`).sockets.size;
    if (clientsCount === 0) {
      SensorTemperaturaManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on('error', (error) => {
    genericLogger.error(`Socket Sensor Temperatura | Error | ctrl_id = ${ctrl_id}`, error);
  });
};
