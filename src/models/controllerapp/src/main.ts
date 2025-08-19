import { NodeAttach, ManagerAttach, Selector, BaseAttach } from './baseAttach';
import { States, getState } from './enums';
import { PartialTicket } from './partialTicket';
import { RequestResult } from './requestResult';
import { FinishTicket } from './finishTicket';
import { NodeTickets } from './nodeTickets';
import { executeQuery } from './dbManager';
import { ResultCode } from './resultCode';
import { ResultSetHeader } from 'mysql2';
import { NodoCameraMapManager } from '../../maps/nodo.camera';
import { appConfig } from '../../../configs';
import { Ticket, type Personal, type Solicitante } from './ticket';
import { Logger } from './logger';
import { Bundle } from './bundle';
import { CameraToCheck, PinOrder } from './types';
import { Camara } from '../../../types/db';
import { FirmwareVersion } from './firmware';
import { endGSM, initGSM, isGSMAvailable } from './serial';
import fs from 'fs';
import * as queries from './queries';
import * as useful from './useful';
import * as codes from './codes';
import * as db2 from './db2';
import * as net from 'net';
import * as cp from 'child_process';

export class Main {
  private static readonly VERSION_MAJOR = 0;
  private static readonly VERSION_MINOR = 6;
  private static readonly VERSION_PATCH = 0;

  /**
   * Whether the object has already been created and the service has already started running
   */
  private static running = false;

  // year in seconds 31,536,000
  // month in seconds 2,628,000
  // private static readonly TABLES_INTERVAL = 2628000;

  private static readonly REQUEST_TIMEOUT = parseInt(process.env.CTRL_REQUEST_TIMEOUT ?? '5') * 1000;

  private static readonly ALIVE_CHECK_INTERVAL_MS = 2 * 1000;
  public static readonly ALIVE_REQUEST_INTERVAL = 3;
  private static readonly ALIVE_CONTROLLER_TIMEOUT = parseInt(process.env.CONTROLLER_TIMEOUT ?? '5');
  private static readonly ALIVE_MANAGER_TIMEOUT = parseInt(process.env.MANAGER_TIMEOUT ?? '5');

  private static readonly TICKET_CHECK_PERIOD = 1 * 1000;

  private static readonly ALIVE_CAMERA_PING_INTERVAL_MS = parseInt(process.env.CAMERA_PING_INTERVAL ?? '4') * 1000;
  private static readonly ALIVE_CAMERA_PING_TIMEOUT_MS = parseInt(process.env.CAMERA_PING_TIMEOUT ?? '2') * 1000;

  // private static readonly WAIT_UPDATE_FOR_ALL_INTERVAL = 1 * 1000;

  private static readonly LOGGER_RELATIVE_PATH = './logs';
  private readonly tag = '█ ';
  private readonly logger: Logger;

  /* Container of `net.Socket` */
  private readonly selector = new Selector();

  private managerServer: net.Server | null = null;

  /* Flags to keep timeouts active */

  private sendMessagesTimer: NodeJS.Timeout | null = null;
  private disconnectionTimer: NodeJS.Timeout | null = null;
  private checkCamerasTimer: NodeJS.Timeout | null = null;
  private ticketsTimer: NodeJS.Timeout | null = null;
  private tablesInterval: NodeJS.Timeout | null = null;

  private processMessages = true;

  /**
   * List of cameras to check their connection state.
   */
  private readonly cameras: CameraToCheck[] = [];

  /**
   * Approved tickets are stored here, grouped by nodes, to send them when the
   * controller has space.
   */
  private readonly ticketsBuffer = new Map<number, NodeTickets>();

  /**
   * Whether the initialization of the service has been successful and the service can start running. The conditions are:
   * - The service is not running
   * - The required folders have been created
   */
  private conditionsMet = true;

  // static readonly isWindows2 = useful.isWindows();
  // static readonly isWindows2 = true;
  static isWindows = false;

  flag = true;

  constructor() {
    // console.log(Encryption.decrypt('hQGr0tZg83kUEIZsr+lPwg==', true));
    // console.log(Encryption.decrypt('hQGr0tZg83kUEIZsr+lPwg==', false));

    // const enc = Encryption.encrypt("admin",true)
    // console.log(enc)
    // console.log(Encryption.decrypt(enc??'', true))

    Main.isWindows = useful.isWindows();
    /* Logger */

    this.logger = new Logger('msControllerService', Main.LOGGER_RELATIVE_PATH);

    /* Check for double running */

    if (Main.running) {
      this.log('Already created and running');
      this.conditionsMet = false;
      return;
    }

    /* Create folders */

    try {
      fs.mkdirSync(Main.LOGGER_RELATIVE_PATH, { recursive: true });
      this.log('Directories created');
    } catch {
      this.conditionsMet = false;
      this.log('Error creating directories');
    }

    /* Init messages */

    this.log(`█ Controller service v ${Main.VERSION_MAJOR}.${Main.VERSION_MINOR}.${Main.VERSION_PATCH} █`);
    this.log(`Running on ${useful.isWindows() ? 'Windows' : useful.isLinux() ? 'Linux' : 'Unknown OS'}`);

    /* Events to clean up */

    process.once('SIGINT', (signal) => {
      this.end(signal);
    });

    process.once('SIGTERM', (signal) => {
      this.end(signal);
    });

    process.once('SIGHUP', (signal) => {
      this.end(signal);
    });

    /* Assign map */
    NodeAttach.ticketsMap = this.ticketsBuffer;

    /* Database manager */

    // this.dbManager = new DBManager(this.#logger)
  }

  async run() {
    if (this.conditionsMet) {
      Main.running = true;
    } else {
      this.log("Conditions are not met. Can't continue.");
      return;
    }

    /* Load serial */
    await initGSM(this.logger);

    /* Load data from database */

    if (!(await this.loadNodes())) {
      return;
    }
    await this.loadAcceptedTickets();

    /* Server for manager */

    this.startServerForManager();

    /* Try to connect to controllers */

    await this.startNodes();

    /* Start interval to send messages */

    this.startSendingMessages();

    /* Start intervals to check states and send tickets */

    setTimeout(this.processOneFromAll, 1);
    setTimeout(this.startDisconnectionDetection, Main.ALIVE_CHECK_INTERVAL_MS, this.selector);
    setTimeout(this.startCamerasCheck, Main.ALIVE_CAMERA_PING_INTERVAL_MS);

    this.startTicketsCheck();
  }

  public static getVersionString(): string {
    return `${Main.VERSION_MAJOR}.${Main.VERSION_MINOR}.${Main.VERSION_PATCH}`;
  }

  /**
   * Compare a version with the server's
   * @param major
   * @param minor
   * @param patch
   * @returns
   * @see {@linkcode Main.compareVersions}
   */
  public static compareVersionWithMain(major: number, minor: number, patch: number): 1 | 0 | -1 {
    return this.compareVersions({ major: Main.VERSION_MAJOR, minor: Main.VERSION_MINOR, patch: Main.VERSION_PATCH }, { major: major, minor: minor, patch: patch });
  }

  /**
   * Compare two versions.
   * @param ver1
   * @param ver2
   * @returns 1 if first version is newer than the second, 0 if the same and -1 if older.
   */
  public static compareVersions(ver1: FirmwareVersion, ver2: FirmwareVersion) {
    if (ver1.major === ver2.major && ver1.minor === ver2.minor && ver1.patch === ver2.patch) {
      return 0;
    } else if (ver1.major > ver2.major || (ver1.major === ver2.major && ver1.minor > ver2.minor) || (ver1.major === ver2.major && ver1.minor === ver2.minor && ver1.patch > ver2.patch)) {
      return 1;
    }
    return -1;
  }

  /**
   *
   * @param major
   * @returns 1 if the provided major is older, 0 if the same, -1 if newer.
   */
  public static compareMajorWithMain(major: number): 1 | 0 | -1 {
    return Main.VERSION_MAJOR > major ? 1 : Main.VERSION_MAJOR < major ? -1 : 0;
  }

  /**
   * Process one cashed message from all sockets registered. Af the end of the method, a timeout is set to call it again, thus simulating a loop.
   */
  private processOneFromAll = async () => {
    // Check channels count
    // if(useful.timeInt() % 10 === 0){
    //   if(this.flag){
    //     console.log(this.selector.nodeAttachments[0]?.printKeyCount(this.selector))
    //     this.flag = false
    //   }
    // }else{
    //   this.flag = true
    // }

    // Process messages from nodes
    for (const node of this.selector.nodeAttachments) {
      const code = new ResultCode();
      const bundle = new Bundle();
      await node.readOne(this.selector, code, bundle);
    }

    // Process messages from managers
    for (const manager of this.selector.managerConnections) {
      const code = new ResultCode();
      const bundle = new Bundle();
      await manager.readOne(this.selector, code, bundle);
      // switch (code.code) {
      //   case Result.CAMERA_ADD:
      //   case Result.CAMERA_UPDATE:
      //     this.addUpdateCamera(bundle.targetCamera);
      //     break;
      //   case Result.CAMERA_DISABLE:
      //     this.removeCamera(bundle.targetCamera.nodeID, bundle.targetCamera.cameraID);
      //     break;
      //   default:
      //     break;
      // }
    }
    if (this.processMessages) {
      setTimeout(this.processOneFromAll, 1);
    }
  };

  private startSendingMessages() {
    this.sendMessagesTimer = setInterval(() => {
      // Send messages to controllers
      for (const node of this.selector.nodeAttachments) {
        // Use same buffer

        if (Selector.isChannelConnected(node._currentSocket) || node.isLogged()) {
          // Send through websocket
          node.tryRequestKeepalive();
          if (node.sendOne(this.selector)) {
            node.setLastMessageTime();
          }
        } else if (!node.isLogged() && isGSMAvailable()) {
          // Send throught GSM
          // sendGSM();
        }
      }

      // Send messages to managers
      for (const manager of this.selector.managerConnections) {
        manager.sendOne(this.selector);
      }
    }, 1);
  }

  /**
   * Start the server for the managers.
   */
  private startServerForManager() {
    this.managerServer = net.createServer((connection) => {
      try {
        const newManagerSocket = new ManagerAttach(this.logger, connection);
        this.selector.managerConnections.push(newManagerSocket);
        this.log(`Managers after push: ${this.selector.managerConnections.length}`);

        connection.setTimeout(Main.ALIVE_MANAGER_TIMEOUT, () => {
          this.log('Manager idle timeout');
          // Activate when the manager sends keep alives to the server. Managers should not reconnect automaticaly
          // newManagerSocket.reconnect(this.selector)
        });

        connection.on('data', (data: Buffer) => {
          // this.log(`Received '${data}'`);
          newManagerSocket.addData(data);
        });

        connection.on('end', () => {
          this.log('Manager disconnected');
          newManagerSocket.reconnect(this.selector);
        });

        // Triggers 'end' and 'close' events
        connection.on('error', () => {
          this.log('Manager error');
          // newManagerSocket.reconnect(this.selector);
        });

        connection.on('close', (hadError) => {
          this.log(`Manager closed. ${hadError ? 'With' : 'No'} error.`);
          newManagerSocket.reconnect(this.selector);
        });

        this.log('Manager accepted and events set.');
      } catch {
        this.log('Error setting object for manager');
      }
    });

    this.managerServer.on('error', (e: any) => {
      this.log(`ERROR listening to managers. Code ${e.code}`);
    });

    this.managerServer.listen(appConfig.server.manager_port, appConfig.server.ip, 16, () => {
      this.log(`Server for managers listening on ${appConfig.server.manager_port}`);
    });
  }

  /**
   * Load information related to the nodes.
   * @returns False if the nodes could not be read from the database or if some tables could not be created, true otherwise.
   */
  private async loadNodes(): Promise<boolean> {
    // Get nodes
    const res = await executeQuery<db2.Controlador2[]>(queries.nodeGetForSocket);
    if (!res) {
      this.log('ERROR Querying nodes.');
      return false;
    }

    // Fill nodes
    for (const node of res) {
      const newNode = NodeAttach.getInstanceFromPacket(node, this.logger);
      this.selector.nodeAttachments.push(newNode);
    }
    this.log(`Loaded ${this.selector.nodeAttachments.length} nodes.`);
    return true;
  }

  /**
   * Read nodes from database, cancel current keys that are related to controllers
   * in selector, start a connection for each node and register them in the
   * selector.
   */
  private async startNodes() {
    for (const node of this.selector.nodeAttachments) {
      // Save initial state. Disconnected by default.
      await node.insertNet(false);
      node.tryConnectNode(this.selector, true, false);
    }
    this.log('Nodes started.');
  }

  /**
   * If the ticket exists, remove it from the pending list and send a
   * {@linkcode Codes.CMD_TICKET_REMOVE} command.
   *
   * @param nodeID
   * @param ticketID
   */
  private removeTicket(nodeID: number, ticketID: number, fromController = true) {
    this.log('Removing ticket...');
    const partialNode = this.ticketsBuffer.get(nodeID);
    if (!partialNode) {
      this.log(`Ticket ID = ${ticketID} has no partial node ID ${nodeID}`);
      return;
    }
    const tickets = partialNode.tickets;
    let found = false;

    // Remove from pending
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].ticketID === ticketID) {
        found = true;
        tickets.splice(i, 1);
        this.log(`Ticket ID = ${ticketID} removed from pending`);
        break;
      }
    }

    // Remove from controller
    if (fromController) {
      const nodeOptional = this.selector.getNodeAttachByID(nodeID);
      if (!nodeOptional) {
        this.log(`No node attach ID = ${nodeID}`);
      } else {
        if (nodeOptional.isLogged()) {
          nodeOptional.addCommandForControllerBody(codes.CMD_TICKET_REMOVE, -1, [ticketID.toString()]);
          this.log('Added command for controller.');
        } else {
          this.log(`Node ID = ${nodeID} was not connected.`);
        }
      }
    }

    if (!found) {
      this.log(`Could not find ticket ID = ${ticketID} in pending list`);
    }
    let count = 0;
    for (const partial of this.ticketsBuffer.values()) {
      count += partial.tickets.length;
    }
    this.log(`Total tickets: ${count}`);
  }

  /**
   * Add a ticket to the pending list that is supposed to be accepted. It will be
   * send as soon as the controller has space.
   *
   * @param nodeID        ID of the target node as it appears in the database.
   * @param partialTicket The ticket data.
   */
  private addTicket(nodeID: number, partialTicket: PartialTicket) {
    const partialNode = this.ticketsBuffer.get(nodeID);
    if (partialNode) {
      partialNode.tickets.push(partialTicket);
      this.log(`Ticket ID = ${partialTicket.ticketID} added to node ${nodeID}`);
    } else {
      const newPartialNode = new NodeTickets();
      newPartialNode.tickets.push(partialTicket);
      this.ticketsBuffer.set(nodeID, newPartialNode);
      this.log(`New partial node created ID = ${nodeID} and ticket ID = ${partialTicket.ticketID} added`);
    }
    let count = 0;
    for (const partial of this.ticketsBuffer.values()) {
      count += partial.tickets.length;
    }
    this.log(`Total tickets: ${count}`);
  }

  private static validateSolicitor(solicitor: Solicitante): boolean {
    return solicitor.tt_id > 0 && solicitor.sn_id > 0 && solicitor.ctrl_id > 0 && solicitor.p_id > 0 && solicitor.co_id > 0;
  }

  private static validateWorker(worker: Personal): boolean {
    return worker.c_id > 0 && worker.co_id > 0;
  }

  /**
   * Convert this instance to an array that fits the parameters needed by
   * {@linkcode queries.insertWorker}. (nombre, telefono, dni, c_id, co_id, rt_id, foto)
   *
   * @param ticketID ID of the ticket to register this worker to.
   * @param filename Value to fill in the column called 'foto'.
   * @returns Array of parameters.
   */

  private workerToArrayForQuery(worker: Personal, ticketID: number, filename: string | null): any[] {
    return [worker.nombre, worker.apellido, worker.telefono, worker.dni, worker.c_id, worker.co_id, ticketID, filename];
  }

  public static async updateTicketState(finalState: number, ticketID: number, nodeID: number) {
    await executeQuery(BaseAttach.formatQueryWithNode(queries.finishTicket, nodeID), [finalState, useful.getCurrentDate(), ticketID]);
  }

  private async saveTicketState(finalState: number, ticketID: number, nodeID: number) {
    await Main.updateTicketState(finalState, ticketID, nodeID);
    this.log(`Final state of ticket ID = ${ticketID} : ${finalState}`);
  }

  public async sendSecurity(controllerID: number, security: boolean): Promise<RequestResult> {
    const node = this.selector.getNodeAttachByID(controllerID);
    if (!node) {
      this.log(`The node ${controllerID} does not exist.`);
      return new RequestResult(false, `El nodo ID = ${controllerID} no existe`);
    }
    // Asynchronous task
    const myPromise: Promise<RequestResult> = new Promise((resolve, _reject) => {
      let ignoreTimeout = false;
      if (Selector.isChannelConnected(node._currentSocket)) {
        node.disableArmButton(true);
        // Timeout for this operation
        const securityHandle = setTimeout(() => {
          if (ignoreTimeout) {
            return;
          }
          this.log(`Remove message ID = ${msgID} by timeout.`);
          // Message has to be removed anyways
          node.removePendingMessageByID(msgID, codes.J_ERR_TIMEOUT, true, false);
          node.disableArmButton(false);
          resolve(new RequestResult(false, `El controlador ID = ${controllerID} no ha respondido a tiempo.`));
        }, Main.REQUEST_TIMEOUT);
        // Send order to controller
        const codeToSend = security ? codes.VALUE_ARM : codes.VALUE_DISARM;
        const msgID = node.addCommandForControllerBody(codes.CMD_CONFIG_SET, -1, [codes.VALUE_SECURITY_WEB.toString(), codeToSend.toString()], true, true, (receivedCode) => {
          ignoreTimeout = true;
          clearTimeout(securityHandle);
          // Valid responses
          const definite = receivedCode === codes.VALUE_ARM || receivedCode === codes.VALUE_DISARM;
          if (definite || receivedCode === codes.VALUE_ARMING || receivedCode === codes.VALUE_DISARMING) {
            node.disableArmButton(!definite);
            resolve(new RequestResult(true, `Orden de seguridad recibida.`, receivedCode));
          } else {
            node.disableArmButton(false);
            resolve(new RequestResult(false, `La order no se pudo confirmar.`, receivedCode));
          }
          this.log(`Response from controller ${useful.toHex(receivedCode)}`);
        });
        this.log('Added order for controller. Waiting response...');
      } else {
        this.log(`Controller ${controllerID} disconnected.`);
        resolve(new RequestResult(false, `El controlador ID = ${controllerID} no está conectado.`));
      }
    });
    return myPromise;
  }

  /**
   * Process an order to change the state of a ticket. This method considers that
   * all the possible states of the ticket can only be 4: ACCEPTED,
   * WAITING_APPROVE, CANCELLED or REJECTED. Other states in the database or as an
   * action is illegal and ends execution of this method.
   *
   * @param newFinish Order data from the web application
   * @returns The result of the operation
   */
  async onFinishTicket(newFinish: FinishTicket): Promise<RequestResult> {
    if (!newFinish.isValid()) {
      this.log(`Invalid finish ticket`);
      return new RequestResult(false, `Algún campo contiene un valor fuera de rango.`);
      // return States.ILLEGAL;
    }
    // Read the ticket info from database
    const ticketID = newFinish.rt_id;
    const nodeID = newFinish.ctrl_id;
    // co_id, fechacomienzo, fechatermino, estd_id
    const ticketData = await executeQuery<db2.OneTicket[]>(BaseAttach.formatQueryWithNode(queries.ticketSelectOne, nodeID), [ticketID]);
    if (!ticketData) {
      this.log(`No ticket data for ID = ${ticketID}`);
      return new RequestResult(false, `Error leyendo ticket ID = ${ticketID} de la base de datos.`);
    }
    // Monitor state by default
    let monitor = States.ERROR;
    // Get current state
    const currentState = getState(ticketData[0].estd_id);
    let isFinal = false;
    switch (currentState) {
      case States.ABSENCE:
      case States.FINISHED:
      case States.CANCELLED:
      case States.REJECTED:
      case States.IGNORED:
        isFinal = true;
        break;
      default:
        isFinal = false;
    }
    let second = false;
    switch (currentState) {
      case States.ACCEPTED:
      case States.WAITING_APPROVE:
      case States.ATTENDED:
        second = true;
        break;
      default:
        second = false;
    }
    const isExpected = isFinal || second;
    // Check illegal states
    if (!isExpected) {
      this.log('Error getting current ticket state. Unknown state.');
      return new RequestResult(false, `El ticket ID = ${ticketID} tiene un estado inválido.`);
    }
    const newAction = getState(newFinish.action);
    if (newAction === States.IMPOSSIBLE) {
      this.log('Unknown new action.');
      return new RequestResult(false, `Acción inválida para el ticket.`);
    }

    // Execute order

    // Check for final states
    if (isFinal) {
      this.log(`Ticket ID=${ticketID} is already finished with state ${currentState}`);
      return new RequestResult(false, `El ticket ya está finalizado.`);
    } else {
      // Can only request to accept, reject, cancel or unattended.
      if (currentState === States.WAITING_APPROVE) {
        // These events can happen only when the ticket is waiting for approve.
        switch (newAction) {
          case States.ACCEPTED:
            // console.log('Accepted  ticket:')
            // console.log(ticketData[0])
            const start = useful.datetimeToLong(ticketData[0].fechacomienzo);
            const end = useful.datetimeToLong(ticketData[0].fechatermino);
            await this.saveTicketState(newAction, ticketID, nodeID);
            this.addTicket(nodeID, new PartialTicket(ticketID, ticketData[0].co_id, start, end));
            monitor = States.EXECUTED;
            break;
          // The guest that created the ticket can cancel it.
          case States.CANCELLED:
          case States.REJECTED:
          case States.IGNORED:
            // In state WAITING_APPROVE it can always be rejected.
            await this.saveTicketState(newAction, ticketID, nodeID);
            // Ticket was never accepted so there is no need to alter the pending tickets but anyways.
            this.removeTicket(nodeID, ticketID);
            monitor = States.EXECUTED;
            break;
          default:
            this.log(`Illegal new action. Current state: ${currentState} Action: ${newAction}`);
            monitor = States.ILLEGAL;
            break;
        }
      } else if (currentState === States.ACCEPTED) {
        switch (newAction) {
          // These events can happen only if the ticket is accepted.
          // FINISHED can happen only if the ticket is also in time. A ticket should not be finished before it is attended, but anyways.
          // CANCELLED, REJECTED can happen only if the current time is before the start time. A ticket should not be rejected after it's been accepted, but anyways.
          // ABSENCE can happen only after the ticket has ended.
          // case States.FINISHED:
          // case States.REJECTED:
          // Can be cancelled by an admin or a guest
          case States.CANCELLED:
          case States.ABSENCE:
            // case States.ATTENDED:
            await this.saveTicketState(newAction, ticketID, nodeID);
            // if (newAction !== States.ATTENDED) {
            this.removeTicket(nodeID, ticketID);
            // }
            monitor = States.EXECUTED;
            break;
          default:
            this.log(`Illegal new action. Current state: ${currentState} Action: ${newAction}`);
            monitor = States.ILLEGAL;
            break;
        }
      } else if (currentState === States.ATTENDED) {
        switch (newAction) {
          // Ticket can only be finished after it's been attended. Can be finished by an admin or the guest.
          case States.FINISHED:
            await this.saveTicketState(newAction, ticketID, nodeID);
            this.removeTicket(nodeID, ticketID);
            monitor = States.EXECUTED;
            break;
          default:
            this.log(`Illegal new action. Current state: ${currentState} Action: ${newAction}`);
            monitor = States.ILLEGAL;
            break;
        }
      }
    }
    if (monitor === States.EXECUTED) {
      return new RequestResult(true, `Acción ejecutada.`);
    }
    return new RequestResult(false, `Error interno.`);
  }

  /**
   * Process an order to create a ticket.
   *
   * @param newTicket Order data from the web application
   * @returns The result of the operation
   */
  async onTicket(newTicket: Ticket): Promise<RequestResult> {
    const solicitor = newTicket.solicitante;
    if (!Main.validateSolicitor(solicitor)) {
      this.log('Solicitor is not valid');
      // return States.ILLEGAL;
      return new RequestResult(false, 'Algún campo contiene un valor fuera de rango.');
    }
    const nodeID = solicitor.ctrl_id;
    if (!this.selector.getNodeAttachByID(nodeID)) {
      this.log(`Node ${nodeID} does not exist.`);
      // return States.NONEXISTENT;
      return new RequestResult(false, `El controlador con ID ${newTicket.solicitante.ctrl_id} no existe`);
    }
    const insertedTicket = await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertTicket, nodeID), newTicket.toArrayForQuery());
    if (!insertedTicket) {
      this.log('Error inserting ticket');
      // return States.ERROR;
      return new RequestResult(false, `Error creando ticket`);
    }
    const insertedID = insertedTicket.insertId;
    // Save workers
    for (const worker of newTicket.personales) {
      if (!Main.validateWorker(worker)) {
        this.log(`Invalid worker: ${worker}`);
        continue;
      }

      // WORKER PHOTOS ARE NO LONGER WRITTEN HERE, BUT THE PATHS ARE RECEIVED INSTEAD IN THE SAME FIELD
      // Write photo, if conditions are met
      // const byteSize = new AtomicNumber();
      // const newFileName = useful.getReplacedPath((await this.processPhotoField(worker, byteSize, nodeID)) ?? 'error');
      const newFileName = worker.foto;
      // this.log(`File writing result: Filename = '${newFileName ?? '<photo not present>'}' Written = ${byteSize.inner} bytes`);

      // Save worker. All workers who are going to visit the node must have been sent
      // in the JSON.
      if (await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertWorker, nodeID), this.workerToArrayForQuery(worker, insertedID, newFileName))) {
        this.log(`Worker added: Ticket ID ${insertedID} Worker ` + worker);
      } else {
        this.log(`Error adding worker: Ticket ${insertedID}`);
      }
    }
    // Save documents
    for (const doc of newTicket.archivos_cargados) {
      if (await executeQuery(BaseAttach.formatQueryWithNode(queries.insertDocument, nodeID), [doc.ruta, doc.nombreoriginal, doc.tipo, insertedID, doc.tamaño, doc.thumbnail])) {
        this.log(`Added file: Ticket ID ${insertedID} Name '${doc}'`);
      } else {
        this.log(`Error adding file: Ticket ID ${insertedID} Name '${doc}'`);
      }
    }
    this.log(`Ticket created ID ${insertedID}.`);
    // return States.EXECUTED;
    return new RequestResult(true, `Ticket creado`, -1, insertedID);
  }

  /**
   * Process an order to set a state on an output.
   *
   * @param newOrder Order data from the web application
   * @returns The result of the operation
   */
  async onOrder(newOrder: PinOrder): Promise<RequestResult> {
    // Validate order
    if (newOrder.pin <= 0 || newOrder.ctrl_id <= 0) {
      this.log('Pin or node ID negative.');
      // return States.ILLEGAL;
      return new RequestResult(false, 'Algún campo contiene un valor fuera de rango.');
    }
    let newState = codes.VALUE_TO_AUTO; // Automatic state by default.
    switch (newOrder.action) {
      case 1:
        newState = codes.VALUE_TO_ACTIVE;
        break;
      case 0:
        newState = codes.VALUE_TO_AUTO;
        break;
      case -1:
        newState = codes.VALUE_TO_INACTIVE;
        break;
      default:
        this.log(`Invalid action number '${newOrder.action}'.`);
        // return States.ILLEGAL;
        return new RequestResult(false, 'Algún campo contiene un valor fuera de rango.');
    }

    // Check node connection
    const nodeKey = this.selector.getNodeAttachByID(newOrder.ctrl_id);
    if (!nodeKey) {
      this.log(`Controller ${newOrder.ctrl_id} doesn't exist.`);
      return new RequestResult(false, `El nodo ID = ${newOrder.ctrl_id} no existe`);
    }

    // Asynchronous task
    // eslint-disable-next-line no-async-promise-executor
    const myPromise: Promise<RequestResult> = new Promise(async (resolve, _reject) => {
      let monitor = States.ERROR;
      let ignoreTimeout = false;
      if (Selector.isChannelConnected(nodeKey._currentSocket)) {
        // Timeout for this operation
        const reqHandle = setTimeout(async () => {
          if (ignoreTimeout) {
            return;
          }
          this.log(`Remove message ID = ${msgID} by timeout.`);
          // Message has to be removed anyways
          nodeKey.removePendingMessageByID(msgID, codes.J_ERR_TIMEOUT, true, false);
          monitor = States.TIMEOUT;
          await this.registerOrder(newOrder, monitor);
          // resolve(monitor)
          resolve(new RequestResult(false, `El controlador ID = ${newOrder.ctrl_id} no ha respondido a tiempo.`));
        }, Main.REQUEST_TIMEOUT);
        // Send order to controller
        const msgID = nodeKey.addCommandForControllerBody(codes.CMD_PIN_CONFIG_SET, -1, [newOrder.pin.toString(), newState.toString()], true, true, async (code) => {
          ignoreTimeout = true;
          clearTimeout(reqHandle);
          monitor = States.EXECUTED;
          await this.registerOrder(newOrder, monitor);
          // resolve(monitor)
          const res = code === codes.AIO_OK;
          resolve(new RequestResult(res, `Orden para pines ejecutada ${res ? 'correctamente' : `con errores ${useful.toHex(code)}`}.`));
          this.log(`Response from controller ${useful.toHex(code)}`);
        });
        this.log('Added order for controller. Waiting response...');
      } else {
        this.log(`Controller ${newOrder.ctrl_id} disconnected.`);
        monitor = States.DISCONNECTED;
        await this.registerOrder(newOrder, monitor);
        // resolve(monitor)
        resolve(new RequestResult(false, `El controlador ID = ${newOrder.ctrl_id} no está conectado.`));
      }
    });
    return myPromise;
  }

  /**
   * Save the order event in the database.
   * @param order The order received.
   * @param state The resulting state of the order.
   */
  private async registerOrder(order: PinOrder, state: number) {
    // This is the default data that should be saved when an error occurs.
    // pin, orden, fecha, estd_id
    const params = [order.pin, order.action, useful.getCurrentDate(), state, Boolean(order.remoteAccess)];
    this.log(`Inserting request result ${useful.toHex(state)}`);
    await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertRequest, order.ctrl_id), params);
  }

  /**
   * Process the field {@linkcode foto}. If the worker is new, {@linkcode foto} may
   * contain the worker's photo in base 64 format. If not new, {@linkcode foto} must
   * contain the photo file name and that file should already exist.
   *
   * @param byteSize If the photo file is written, the amount of bytes written is
   *                 stored here. If an error occurred, ``-1`` is stored, is no file
   *                 was written, ``0`` is stored.
   * @param nodeID The ID of the node for which the ticket was created for.
   * @returns The proper filename to save in the database, or an error message if an error occurs.
   */
  // private async processPhotoField(worker: Personal, byteSize: AtomicNumber, nodeID: number): Promise<string | null> {
  //   const millis = Date.now();
  //   const fotoOptional = worker.foto;
  //   // Initial state. the case where (isNew && fotoOptional.isPresent()) can still
  //   // change, depending on the success of the file written and that value is set
  //   // inside the writing function.
  //   byteSize.inner = !worker.isNew !== !fotoOptional ? 0 : -1;
  //   // Photo can be optional
  //   if (worker.isNew) {
  //     if (fotoOptional) {
  //       // The final byte size is defined here, if this case occurs
  //       if (await useful.writeNewTicketPhotoFromBase64(fotoOptional, millis, nodeID, byteSize)) {
  //         return useful.getReplacedPath(useful.getPathForNewWorkerPhoto(nodeID, millis));
  //       } else {
  //         return 'error-WritingFile';
  //       }
  //     } else {
  //       //				return "error-PhotoWasOptional";
  //       return null;
  //     }
  //   }
  //   // Photo file name is mandatory
  //   else {
  //     return fotoOptional ?? 'error-NoFotoOfExistingWorker';
  //   }
  // }

  /**
   * Load accepted tickets from the database. This is called once on every start
   * of the program to load a buffer of pending tickets to send.
   */
  private async loadAcceptedTickets() {
    this.log('Loading approved tickets...');
    let nodes = 0;
    let tickets = 0;
    const nodesData = await executeQuery<db2.GeneralNumber[]>(queries.nodeSelectID);
    if (!nodesData) {
      this.log("Error getting nodes' IDs");
      return;
    }
    for (const node of nodesData) {
      nodes++;
      const nodeID = node.entero;
      const newNode = new NodeTickets();
      if (this.ticketsBuffer.has(nodeID)) {
        this.log(`ERROR Node with duplicate ID? ID=${nodeID}`);
      } else {
        this.ticketsBuffer.set(nodeID, newNode);
      }
      const ticketsData = await executeQuery<db2.Ticket[]>(BaseAttach.formatQueryWithNode(queries.ticketSelectAccepted, nodeID));
      if (!ticketsData) {
        this.log(`Error getting approved tickets for node ID=${nodeID}`);
        continue;
      }
      for (const ticket of ticketsData) {
        tickets++;
        const start = useful.datetimeToLong(useful.fixDate(ticket.fechacomienzo));
        const end = useful.datetimeToLong(useful.fixDate(ticket.fechatermino));
        newNode.tickets.push(new PartialTicket(ticket.rt_id, ticket.co_id, start, end));
      }
    }
    this.log(`Loaded ${tickets} ticket(s) for ${nodes} node(s).`);
  }

  /**
   * Start a thread that, if there are pending tickets, periodically checks if a
   * controller can accept a ticket. If a controller has space for tickets and
   * there are tickets pending for that controller, the ticket is send and removed
   * from the buffer.
   *
   * NEXT UPDATE: For the controller to always get the valid tickets on every connection, this function should not remove the tickets when they are sent,
   * but only when they expire. Expiration task should be performed here too.
   */
  private startTicketsCheck() {
    this.ticketsTimer = setInterval(() => {
      for (const ticket of this.ticketsBuffer) {
        const nodeID = ticket[0];
        const ticketList = ticket[1].tickets;

        // Check tickets' end dates and remove them if expired (current datetime is more than end datetime)
        for (const ticket of ticketList) {
          if (ticket.endTime < useful.timeInt()) {
            // The controller should also delete expired tickets by its own
            this.removeTicket(nodeID, ticket.ticketID, false);
            this.log(`Ticket ID = ${ticket.ticketID} removed from buffer of node ${nodeID}`);
          }
        }

        // If there are tickets left
        if (ticketList.length === 0) {
          // log("No tickets pending in node ID = %d", nodeID);
          continue;
        }

        // Check if at least one is not yet sent
        let atLeastOne = false;
        for (const ticket of ticketList) {
          if (!ticket.sent) {
            atLeastOne = true;
            break;
          }
        }
        if (!atLeastOne) {
          continue;
        }

        // If node is registered
        const attach = this.selector.getNodeAttachByID(nodeID);
        if (!attach) {
          // log("No attachment for node ID = %d", nodeID);
          continue;
        }
        // If node is logged in
        if (!attach.isLogged()) {
          // log("Attachment ID = %d not logged", nodeID);
          continue;
        }
        attach.addCommandForControllerBody(codes.CMD_CONFIG_GET, -1, [codes.VALUE_CAN_ACCEPT_TICKET.toString()], true, true, (available: number) => {
          if (available <= 0) {
            // this.log(`No space for ticket in node ID = ${nodeID}`);
            return;
          }
          // log("Available %d in controller ID=%d", available, nodeID);
          let count = 0;
          for (const ticket of ticketList) {
            if (ticket.sent) {
              continue;
            }
            ticket.sent = true;
            attach.addCommandForControllerBody(codes.CMD_TICKET_ADD, -1, ticket.getBody(), true, true, async (rsp: number) => {
              if (rsp === codes.AIO_OK || rsp === codes.ERR_NO_CHANGE) {
                await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.ticketSetSent, nodeID), [ticket.ticketID]);
                this.log(`Ticket ID = ${ticket.ticketID} ${rsp === codes.AIO_OK ? 'added to' : 'was already in the'} controller.`);
              } else {
                this.log(`Couldn't add ticket ID = ${ticket.ticketID}. Error ${useful.toHex(rsp)}. Not removed.`);
              }
            });
            count++;
            if (count >= available) {
              break;
            }
          }
        });
      }
    }, Main.TICKET_CHECK_PERIOD);
  }

  private async registerCameraEvent(state: boolean, camera: CameraToCheck) {
    await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertCameraState, camera.nodeID), [camera.camara.cmr_id, useful.getCurrentDate(), state]);
    await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.cameraSetNet, camera.nodeID), [state, camera.camara.cmr_id]);
    this.log(`Camera ID = ${camera.camara.cmr_id} in node ID = ${camera.nodeID} changed state to ACTIVO`);
  }

  addDisconnectedCamera(nodeID: number, newCamera: Camara): boolean {
    const alreadyPresent = this.cameras.some((e) => nodeID === e.nodeID && newCamera.cmr_id === e.camara.cmr_id);
    if (!alreadyPresent && newCamera.conectado === 0 && newCamera.activo === 1) {
      this.cameras.push(new CameraToCheck(nodeID, newCamera));
      this.log(`Camera aded to check connection. Node ID ${nodeID}, camera ID ${newCamera.cmr_id}`);
      return true;
    } else {
      this.log(`Camera already present. Node ID ${nodeID}, camera ID ${newCamera.cmr_id}`);
    }
    return false;
  }

  private startCamerasCheck = async () => {
    const tempCams = this.cameras.slice();
    for (let i = 0; i < tempCams.length; i++) {
      const tempCamera = this.cameras[i];

      // Check in camera
      if (!tempCamera.checkedIn) {
        await this.registerCameraEvent(false, tempCamera);
        tempCamera.checkedIn = true;
      }

      // Remove inactive camera
      if (tempCamera.camara.activo === 0) {
        this.cameras.splice(i, 1);
      }

      // Try to reach
      else if (tempCamera.camara.conectado === 0) {
        try {
          // Send ping or try to reach address
          if (Main.isWindows) {
            cp.exec(`ping ${tempCamera.camara.ip} -n 1`, { timeout: Main.ALIVE_CAMERA_PING_TIMEOUT_MS }, async (error, stdout, _stderror) => {
              if (error) {
                // this.log(`Error sending ping to ${cam.cameraIP}. Code ${error.code}`);
                // this.log(`Error output\n ${stderror}\nStdout\n${stdout}`)
              } else {
                const res = stdout.includes('TTL');
                // this.log(`Output\n${ res}`);
                if (res) {
                  // cam.setAlive();
                  await this.registerCameraEvent(true, tempCamera);
                  NodoCameraMapManager.update(tempCamera.nodeID, tempCamera.camara.cmr_id, { conectado: 1 });
                  this.cameras.splice(i, 1);
                }
              }
            });
          } else {
            this.log(`Ping only implemented for Windows`);
          }
          tempCamera.errorNotified = false;
        } catch (e) {
          if (!tempCamera.errorNotified) {
            this.log(`Error trying to rach camera ID = ${tempCamera.camara.cmr_id}. ${e}`);
            tempCamera.errorNotified = true;
          }
        }
      }
    }
    setTimeout(this.startCamerasCheck, Main.ALIVE_CAMERA_PING_INTERVAL_MS);
  };

  /**
   * Start a timer that will test if each channel IS STILL CONNECTED. The test is based on any data received from the
   * channel. When a time has passed and no data has been received, the channel will be considered 'dead', it will be closed, the key
   * canceled and a new channel will be registered with the same attachment, thus 'reseting' the connection from the backend.
   * To ensure that the controller will always send 'something', a keep alive request will be send to the
   * controller periodically on certain conditions (see {@linkcode NodeAttach.tryRequestKeepalive}).
   *
   * @see  {@linkcode NodeAttach.tryRequestKeepalive}
   * @param selector Selector with the registered keys.
   */
  private startDisconnectionDetection = async (selector: Selector) => {
    const nodeCopy = selector.nodeAttachments.slice();

    for (const node of nodeCopy) {
      if (node.hasBeenInactiveFor(Main.ALIVE_CONTROLLER_TIMEOUT)) {
        if (node.isLogged()) {
          this.log(`Channel '${node}' ID = ${node.controllerID} is dead. Reconnecting...`);
          BaseAttach.simpleReconnect(this.selector, node);
          node.resetKeepAliveRequest();
          await node.insertNet(false);
          node.printKeyCount(selector);
          ManagerAttach.connectedManager?.addNodeState(codes.VALUE_DISCONNECTED, node.controllerID);
        }
      }
    }

    let deleted = false;
    const mngrCopy = this.selector.managerConnections.slice();
    for (const manager of mngrCopy) {
      if (manager.hasBeenInactiveFor(Main.ALIVE_MANAGER_TIMEOUT)) {
        this.log('Manager keep alive timeout');
        manager.reconnect(selector);
        const mngrIndex = this.selector.managerConnections.indexOf(manager);
        if (mngrIndex >= 0) {
          this.selector.managerConnections.splice(mngrIndex, 1);
          deleted = true;
        }
      }
    }
    if (deleted) {
      this.log(`Managers left: ${this.selector.managerConnections.length}`);
    }
    setTimeout(this.startDisconnectionDetection, Main.ALIVE_CHECK_INTERVAL_MS, selector);
  };

  /**
   * Clean up before ending eveything
   */
  private end(signal: NodeJS.Signals) {
    this.log(`Ending with signal ${signal}`);
    // End GSM
    endGSM();

    // End processing messages
    this.processMessages = false;

    // End timers
    if (this.disconnectionTimer) {
      clearInterval(this.disconnectionTimer);
    }
    if (this.checkCamerasTimer) {
      clearInterval(this.checkCamerasTimer);
    }

    if (this.ticketsTimer) {
      clearInterval(this.ticketsTimer);
    }
    if (this.sendMessagesTimer) {
      clearTimeout(this.sendMessagesTimer);
    }
    if (this.tablesInterval) {
      clearInterval(this.tablesInterval);
    }

    // Close managers
    for (const manager of this.selector.managerConnections) {
      manager._currentSocket?.end(() => {
        this.log(`Manager socket '${manager._tag}' ended`);
      });
    }

    // Close server for managers
    this.managerServer?.close((err) => {
      if (err) {
        this.log(`Server for manager was not started.`);
      } else {
        this.log('Server for manager closed.');
      }
    });

    // Close controllers' sockets
    for (const node of this.selector.nodeAttachments) {
      node._currentSocket?.end(() => {
        node._currentSocket?.destroy();
        this.log(`Socket ended for '${node.toString()}'`);
      });
    }

    this.log(`End of controller service.`);
  }

  /**
   * Log a message with the tag of this object.
   *
   * @param format    Format of the message.
   */
  private log(format: string) {
    if (this.logger) {
      this.logger.log(this.tag + format);
    } else {
      console.log(format);
    }
  }
}
