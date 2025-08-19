import { Router } from 'express';
import { ControladorController } from '../controllers/general/controlador.controller';
import { MySQLContraldorRepository } from '../models/general/controlador/mysql.controlador.repository';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { requestValidator } from '../middlewares/validator.middleware';
import { controladorParamIdSchema } from '../schemas/general/controlador';
import { UserRol } from '../types/rol';
import { paginationUserNotificationSchema } from '../models/general/UserNotification/schemas/PaginationUserNotificationSchema';
import { MySQLUserNotificationRepository } from '../models/general/UserNotification/MySQLUserNotificationRepository';
import { UserNoficationController } from '../controllers/general/user.notification.controller';
import { MySQLNotificationRepository } from '../models/general/Notification/MySQLNotificationRepository';
import { userNotificationParamIdSchema } from '../models/general/UserNotification/schemas/ParamIdSchema';
import { createUserNotificationSchema } from '../models/general/UserNotification/schemas/CreateUserNotificationSchema';
import { AccesoController } from '../controllers/general/acceso.controller';
import { MySQLAccesoRepository } from '../models/general/Acceso/MySQLAccesoRepository';
import { MySQLPersonalRespository } from '../models/general/personal/mysql.personal.repository';
import { MySQLEquipoAccesoRepository } from '../models/general/equipoacceso/mysql.equipo.acceso.repository';
import { MySQLRubroRepository } from '../models/general/rubro/mysql.rubro.repository';
import { MySQLRolRepository } from '../models/general/rol/mysql.rol.repository';
import { MySQLCargoRepository } from '../models/general/cargo/mysql.cargo.repository';

import { paginationAccesoSchema } from '../models/general/Acceso/schemas/pagination.acceso.schema';
import { updateAccesoBodySchema } from '../models/general/Acceso/schemas/UpdateAccesoSchema';
import { accesoParamIdSchema } from '../models/general/Acceso/schemas/ParamIdSchema';
import { createAccesoSchema } from '../models/general/Acceso/schemas/CreateAccesoSchema';
import { RubroController } from '../controllers/general/rubro.controller';
import { RolController } from '../controllers/general/rol.controller';
import { CargoController } from '../controllers/general/cargo.controller';
import { EquipoAccesoController } from '../controllers/general/equipo.acceso.controller';

const mysqlControladorRepository = new MySQLContraldorRepository();
const mysqlUserNotificationRepository = new MySQLUserNotificationRepository();
const mysqlNotificationRepository = new MySQLNotificationRepository();
const mysqlAccesoRepository = new MySQLAccesoRepository();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mysqlEquipoAccesoRepository = new MySQLEquipoAccesoRepository();
const mySQLRubroRepository = new MySQLRubroRepository();
const mySQLRolRepository = new MySQLRolRepository();
const mySQLCargoRepository = new MySQLCargoRepository();

const controladorController = new ControladorController(mysqlControladorRepository);
const userNoficationController = new UserNoficationController(mysqlUserNotificationRepository, mysqlNotificationRepository);
const accesoController = new AccesoController(mysqlAccesoRepository, mysqlPersonalRepository, mysqlEquipoAccesoRepository);

const rubroController = new RubroController(mySQLRubroRepository);
const rolController = new RolController(mySQLRolRepository);
const cargoController = new CargoController(mySQLCargoRepository);

const equipoAccesoController = new EquipoAccesoController(mysqlEquipoAccesoRepository);

export const generalRoutes = Router();
// ========== Controlador ==========

// GET	/general/controlador Obtener controladores
generalRoutes.get('/general/controlador', authenticate, controladorController.listController);
// GET	/general/controlador/:ctrl_id Obtener controlador por id
generalRoutes.get('/general/controlador/:ctrl_id', authenticate, requestValidator({ params: controladorParamIdSchema }), controladorController.singleController);

// ========== Notificacion Usuario ==========

// GET	/notifications?limit=number&offset=number Listar todos las notificaciones del usuario por paginacion
generalRoutes.get('/notifications', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ query: paginationUserNotificationSchema }), userNoficationController.listOffsetPagination);
// GET	/notifications/:nu_id Obtener notificacion por id
generalRoutes.get('/notifications/:nu_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ params: userNotificationParamIdSchema }), userNoficationController.item);
// POST	/notifications Crear una nueva notificacion.
generalRoutes.post('/notifications', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ body: createUserNotificationSchema }), userNoficationController.create);
// PATCH /notifications/:nu_id Actualizar un notificacion como leido.
generalRoutes.patch('/notifications/:nu_id/read', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ params: userNotificationParamIdSchema }), userNoficationController.setNotificationRead);
// PATCH /notifications/read_all Marcar como leido todas las notificaciones
generalRoutes.patch('/notifications/read_all', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), userNoficationController.readAllNotification);

// ========== Acceso ==========
// GET	/accesos?limit=number&offset=number Listar todos los accesos por paginacion
generalRoutes.get('/accesos', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationAccesoSchema }), accesoController.listAccesosWithPersonalOffset);
// GET /accesos/:a_id Obtener acceso por id
generalRoutes.get('/accesos/:a_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: accesoParamIdSchema }), accesoController.singleAcceso);
// POST	/accesos Crear una nueva acceso.
generalRoutes.post('/accesos', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: createAccesoSchema }), accesoController.create);
// PATCH /accesos/:a_id Actualizar un acceso.
generalRoutes.patch('/accesos/:a_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: updateAccesoBodySchema, params: accesoParamIdSchema }), accesoController.update);
// DELETE /accesos/:a_id Eliminar un acceso.
generalRoutes.delete('/accesos/:a_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: accesoParamIdSchema }), accesoController.delete);

// ========== Rubro ==========
generalRoutes.get('/rubros', authenticate, rubroController.list);

// ========== Roles ==========
generalRoutes.get('/roles', authenticate, rolController.list);

// ========== Cargos ==========
generalRoutes.get('/cargos', authenticate, cargoController.list);

// ========== Equipo de accesos ==========
generalRoutes.get('/equipoaccesos', authenticate, equipoAccesoController.list);
