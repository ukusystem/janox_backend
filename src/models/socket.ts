import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import {
  lastSnapshotSocket,
  pinEntradaSocket,
  registroEntradaSocket,
  NamespaceControllerState,
  contollerStateSocket,
  NamespacePinSalida,
  pinSalidaSocket,
  NamespaceMedEnergia,
  medEnergiaSocket,
  senTemperaturaSocket,
  NamespaceSidebarNav,
  navbarNavSocket,
  NamespaceLastSnapshot,
  NamespaceAlarm,
  alarmSocket,
  NamespaceRegistroEntrada,
  NamespacePinEntrada,
  NamespaceSenTemperatura,
  NamespaceRecordStream,
  recordStreamSocket,
} from '../controllers/socket';
import { camStreamSocket } from '../controllers/socket/stream/camera.stream.socket';
import { NamespaceRegistroAcceso, registroAccesoSocket } from '../controllers/socket/registro.acceso';
import { NamespaceTicketSchedule } from '../controllers/socket/ticket.schedule/ticket.schedule.types';
import { ticketScheduleSocket } from '../controllers/socket/ticket.schedule/ticket.schedule.socket';
import { socketAuthWithRoles } from '../middlewares/auth.middleware';
import { UserRol } from '../types/rol';
import { NamespaceTemperature } from '../controllers/socket/temperature.region/temperature.types';
import { temperatureSocket } from '../controllers/socket/temperature.region/temperature.socket';
import { NamespaceEnergy } from '../controllers/socket/energy.region/energy.types';
import { energySocket } from '../controllers/socket/energy.region/energy.socket';

export class Sockets {
  #io: Server;

  constructor(httpServer: HttpServer) {
    this.#io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://172.16.4.53:3005', 'http://172.16.4.53:3000', 'http://172.16.4.3:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.initEvents();
  }

  initEvents() {
    // Namespace "/stream/nodo_id/cmr_id/calidad"
    const StreamNSP = this.#io.of(/^\/stream\/(\d+)\/(\d+)\/(q\d+)$/);
    StreamNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    StreamNSP.on('connection', (socket) => {
      camStreamSocket(this.#io, socket);
    });

    // Namespace : "/sensor_temperatura/ctrl_id/id"
    const SenTempNSP: NamespaceSenTemperatura = this.#io.of(/^\/sensor_temperatura\/\d+$/);
    SenTempNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    SenTempNSP.on('connection', (socket) => {
      senTemperaturaSocket(this.#io, socket);
    });

    // Namespace : "/temperature"
    const TemperatureNSP: NamespaceTemperature = this.#io.of('/temperature');
    TemperatureNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    TemperatureNSP.on('connection', (socket) => {
      temperatureSocket(this.#io, socket);
    });

    // Namespace : "/energy"
    const EnergyNSP: NamespaceEnergy = this.#io.of('/energy');
    EnergyNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    EnergyNSP.on('connection', (socket) => {
      energySocket(this.#io, socket);
    });

    // Namespace : "/modulo_energia/ctrl_id"
    const ModEnergiaNSP: NamespaceMedEnergia = this.#io.of(/^\/modulo_energia\/\d+$/);
    ModEnergiaNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    ModEnergiaNSP.on('connection', (socket) => {
      medEnergiaSocket(this.#io, socket);
    });

    // Namespace: /sidebar_nav
    const SidebarNavNSP: NamespaceSidebarNav = this.#io.of('/sidebar_nav');
    SidebarNavNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    SidebarNavNSP.on('connection', (socket) => {
      navbarNavSocket(this.#io, socket);
    });

    // Namespace :  "/registro_acceso/ctrl_id"
    const RegAccesoNSP: NamespaceRegistroAcceso = this.#io.of(/^\/registro_acceso\/\d+$/);
    RegAccesoNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    RegAccesoNSP.on('connection', (socket) => {
      registroAccesoSocket(this.#io, socket);
    });

    // Namespace :  "/registro_entrada/ctrl_id"
    const RegEntNSP: NamespaceRegistroEntrada = this.#io.of(/^\/registro_entrada\/\d+$/);
    RegEntNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    RegEntNSP.on('connection', (socket) => {
      registroEntradaSocket(this.#io, socket);
    });

    // Namespace: "/tickets/ctrl_id/"
    const TicketScheduleNSP: NamespaceTicketSchedule = this.#io.of(/^\/tickets\/\d+$/);
    TicketScheduleNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]));
    TicketScheduleNSP.on('connection', (socket) => {
      ticketScheduleSocket(this.#io, socket);
    });

    // Namespace: "/pin_entrada/ctrl_id"
    const PinEntradaNSP: NamespacePinEntrada = this.#io.of(/^\/pin_entrada\/\d+$/);
    PinEntradaNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    PinEntradaNSP.on('connection', (socket) => {
      pinEntradaSocket(this.#io, socket);
    });

    // Namespace: "/controller_state/ctrl_id"
    const ControllerStateNSP: NamespaceControllerState = this.#io.of(/^\/controller_state\/\d+$/);
    ControllerStateNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    ControllerStateNSP.on('connection', (socket) => {
      contollerStateSocket(this.#io, socket);
    });

    // Namespace: "/pines_salida/ctrl_id"
    const PinSalidaNSP: NamespacePinSalida = this.#io.of(/^\/pines_salida\/\d+$/);
    PinSalidaNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    PinSalidaNSP.on('connection', (socket) => {
      pinSalidaSocket(this.#io, socket);
    });

    // Namespace: "/record_stream/ctrl_id/cmr_id"
    const StreamRecordNSP: NamespaceRecordStream = this.#io.of(/^\/record_stream\/(\d+)\/\d+$/);
    StreamRecordNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    StreamRecordNSP.on('connection', (socket) => {
      recordStreamSocket(this.#io, socket);
    });

    // Namespace : "/last_snapshot/ctrl_id"
    const LastSnapshotNSP: NamespaceLastSnapshot = this.#io.of(/^\/last_snapshot\/\d+$/);
    LastSnapshotNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    LastSnapshotNSP.on('connection', (socket) => {
      lastSnapshotSocket(this.#io, socket);
    });

    // Namespace: "/voice_stream/ctrl_id/ip"
    // this.#io.of(/^\/voice_stream\/(\d+)\/([\d\.]+)$/).on('connection', (socket) => {
    //   voiceStreamSocket(this.#io, socket);
    // });

    // Namespace : "/last_snapshot/ctrl_id"
    const AlarmNSP: NamespaceAlarm = this.#io.of('/alarm_notification');
    AlarmNSP.use(socketAuthWithRoles([UserRol.Administrador, UserRol.Gestor]));
    AlarmNSP.on('connection', (socket) => {
      alarmSocket(this.#io, socket);
    });
  }
}
