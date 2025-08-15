import { Server } from 'socket.io';

import { SocketTemperature } from './temperature.types';
import { TemperatureManager, TemperatureObserverImp } from './temperature.manager';
import { RegionMapManager } from '../../../models/maps';

export const temperatureSocket = async (io: Server, socket: SocketTemperature) => {
  // Namespace : /temperature
  const observer = new TemperatureObserverImp(socket);
  TemperatureManager.registerObserver(observer);

  const initialData = TemperatureManager.getInitialData();
  const regiones = RegionMapManager.getAllRegion();

  socket.emit('initial_data', initialData, regiones);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/temperature`).sockets.size;
    if (clientsCount === 0) {
      TemperatureManager.unregisterObserver();
    }
  });
};
