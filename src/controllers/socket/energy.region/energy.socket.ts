import { Server } from 'socket.io';

import { RegionMapManager } from '../../../models/maps';
import { SocketEnergy } from './energy.types';
import { EnergyManager, EnergyObserverImp } from './energy.manager';

export const energySocket = async (io: Server, socket: SocketEnergy) => {
  // Namespace : /energy
  const observer = new EnergyObserverImp(socket);
  EnergyManager.registerObserver(observer);

  const initialData = EnergyManager.getInitialData();
  const regiones = RegionMapManager.getAllRegion();

  socket.emit('initial_data', initialData, regiones);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/energy`).sockets.size;
    if (clientsCount === 0) {
      EnergyManager.unregisterObserver();
    }
  });
};
