import { Server } from 'socket.io';
import { SocketSidebarNav } from './sidebar.nav.types';
import { SidebarNavManager, SidebarNavSocketObserver } from './sidebar.nav.manager';

export const navbarNavSocket = async (io: Server, socket: SocketSidebarNav) => {
  // Namespace : /sidebar_nav
  const controllers = SidebarNavManager.getAllControllers();
  socket.emit('controllers', controllers);

  const observer = new SidebarNavSocketObserver(socket);
  SidebarNavManager.registerObserver(observer);

  socket.on('disconnect', () => {
    const clientsCount = io.of(`/sidebar_nav`).sockets.size;
    if (clientsCount === 0) {
      SidebarNavManager.unregisterObserver();
    }
  });
};
