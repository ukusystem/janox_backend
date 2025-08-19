import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { MySQL2 } from '../database/mysql';
import cors from 'cors';
import { authRoutes } from '../routes/auth.routes';
import { errorController } from '../controllers/error';
import { initRoutes } from '../routes/init.routes';
import { cameraRoutes } from '../routes/camera.routes';
import { registerRoutes } from '../routes/register.routes';
import { ticketRoutes } from '../routes/ticket.routes';

import { createServer } from 'node:http';
import path from 'node:path';
import { Sockets } from './socket';
import { smartMapRoutes } from '../routes/smartmap.routes';
import { siteRoutes } from '../routes/site.routes';

import { vmsRoutes } from '../routes/vms.routes';
import { frontEndRoutes } from '../routes/frontend.routes';
import { main } from './controllerapp/controller';
import { MedidorEnergiaManager, PinEntradaManager, PinSalidaManager, RegistroAccesoManager, SensorTemperaturaManager } from '../controllers/socket';
import { ContrataMapManager, ControllerMapManager, EquipoEntradaMapManager, EquipoSalidaMapManager, PersonalMapManager, RegionMapManager, ResolutionMapManager, TipoCamaraMapManager } from './maps';
import { dashboardRouter } from '../routes/dashboard.routes';
import { appConfig } from '../configs';
import { CameraMotionManager } from './camera';
import { NodoCameraMapManager } from './maps/nodo.camera';
import { NvrManager } from './nvr';
import { genericLogger } from '../services/loggers';
import { RegistroEntradaManager } from '../controllers/socket/registro.entrada';
import { TokenManger } from './token.manager';
import { generalRoutes } from '../routes/general.routes';
import { contrataRoutes } from '../routes/contrata.routes';
import { personalRoutes } from '../routes/personal.routes';
import { accesoRoutes } from '../routes/acceso.routes';
import { usuarioRoutes } from '../routes/usuario.routes';

// import { createServer as createServerHttps } from "https";
// import fs from "fs";

export class ServerApp {
  #app: Application;
  #port: number;
  #httpServer;

  #baseApiPath: string = '/api/v1';

  constructor() {
    this.#app = express();
    this.#port = appConfig.server.port;
    this.#httpServer = createServer(this.#app);
    // this.#httpServer = createServerHttps(
    //   {
    //     key: fs.readFileSync(path.resolve( __dirname, '../../crtssl/key.pem')),
    //     cert: fs.readFileSync(path.resolve( __dirname, '../../crtssl/crt.pem')),
    //     passphrase: "test123",
    //   },
    //   this.#app
    // );
    this.middlewares();
    this.routes();
    this.listen();
  }

  static create(): ServerApp {
    const server = new ServerApp();
    return server;
  }

  listen() {
    this.#httpServer.listen(this.#port, () => {
      genericLogger.info(`Servidor corriendo en el puerto ${this.#port}`);
    });
  }

  static async connectDataBase() {
    await MySQL2.create();
  }

  middlewares() {
    //Cors
    this.#app.use(
      cors({
        credentials: true,
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
      }),
    );
    this.#app.use(express.urlencoded({ extended: false }));
    // Desplegar el directorio público
    this.#app.use(express.static(path.resolve(__dirname, '../../public')));
    this.#app.use(express.static(path.resolve(__dirname, '../../deteccionmovimiento')));
    this.#app.use(express.static(path.resolve(__dirname, '../../assets')));
    this.#app.use(express.static(path.resolve(__dirname, '../../nvr')));
    this.#app.use(express.static(path.resolve(__dirname, '../../archivos/personal/')));
    this.#app.use(express.static(path.resolve(__dirname, '../../archivos/ticket')));

    // Parsear y transformar el req.body en json
    this.#app.use(express.json({ limit: '10mb' }));
    // Parsear cookies
    this.#app.use(cookieParser());
  }

  routes() {
    // Autentificacion
    this.#app.use(this.#baseApiPath, authRoutes);
    // InitApp
    this.#app.use(this.#baseApiPath, initRoutes);
    // Camera
    this.#app.use(this.#baseApiPath, cameraRoutes);
    // Dashboard:
    this.#app.use(this.#baseApiPath, dashboardRouter);
    // Register
    this.#app.use(this.#baseApiPath, registerRoutes);
    // Ticket
    this.#app.use(this.#baseApiPath, ticketRoutes);
    // Vms
    this.#app.use(this.#baseApiPath, vmsRoutes);
    // SmartMap
    this.#app.use(this.#baseApiPath, smartMapRoutes);
    // ==== SITE ====
    // Controles:
    this.#app.use(this.#baseApiPath, siteRoutes);
    // ==== General ====
    this.#app.use(this.#baseApiPath, generalRoutes);
    this.#app.use(this.#baseApiPath, contrataRoutes);
    this.#app.use(this.#baseApiPath, personalRoutes);
    this.#app.use(this.#baseApiPath, accesoRoutes);
    this.#app.use(this.#baseApiPath, usuarioRoutes);

    // FrontEnd
    this.#app.use(frontEndRoutes);
    // Otros
    this.#app.all('*', errorController.notFound);

    // Global error handler
    this.#app.use(errorController.globalError);
  }

  async motion() {
    try {
      genericLogger.info(`Iniciando detección de movimiento`);
      await CameraMotionManager.init();
    } catch (error) {
      genericLogger.error(`Error al iniciar detección de movimiento`, error);
      throw error;
    }
  }

  websocket() {
    const socket = new Sockets(this.#httpServer);
    socket.initEvents();
  }

  async initmaps() {
    try {
      // inicializar maps generales primero:
      await ContrataMapManager.init(); // inicializar antes que RegistroAccesoMap
      // await EquipoAccesoMap.init()
      await EquipoEntradaMapManager.init();
      await EquipoSalidaMapManager.init();

      await ResolutionMapManager.init();
      await RegionMapManager.init();
      await ControllerMapManager.init();

      await SensorTemperaturaManager.init();
      await MedidorEnergiaManager.init();
      await PinSalidaManager.init();
      await PinEntradaManager.init();
      await RegistroEntradaManager.init();

      await TipoCamaraMapManager.init();
      await NodoCameraMapManager.init();

      await PersonalMapManager.init();
      await RegistroAccesoManager.init();

      await TokenManger.init();
    } catch (error) {
      genericLogger.error(`Server Model | Error init maps`, error);
      throw error;
    }
  }

  async startNvrMode() {
    try {
      genericLogger.info(`Iniciando modo NVR`);
      await NvrManager.init(); // inicializar despues de NodoCameraMapManager
    } catch (error) {
      genericLogger.error(`Error al iniciar modo NVR`, error);
      throw error;
    }
  }

  runController() {
    main();
  }
}
