import { TicketScheduleManager } from './controllers/socket/ticket.schedule/ticket.schedule.manager';
import { ServerApp } from './models/server';
import { SystemManager } from './models/system';

(async () => {
  try {
    // Conectar a la base de datos:
    await ServerApp.connectDataBase();

    await SystemManager.init();

    // Crear un servidor
    const server = new ServerApp();
    // Inicializar websockets
    server.websocket();
    // Init Maps
    await server.initmaps();

    // Iniciar dectecion de movimiento
    if (process.env.START_SNAPSHOT_MOTION === 'true' || process.env.START_RECORD_MOTION === 'true') {
      await server.motion();
    }

    // Iniciar modo nvr
    if (process.env.START_NVR === 'true') {
      server.startNvrMode();
    }

    // Mio
    server.runController();

    await TicketScheduleManager.init();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
