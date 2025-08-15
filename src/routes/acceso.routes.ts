import { Router } from 'express';
import { MySQLAccesoRepository } from '../models/general/Acceso/MySQLAccesoRepository';

import { authenticate } from '../middlewares/auth.middleware';
import { AccesoController } from '../controllers/general/acceso.controller';
import { MySQLPersonalRespository } from '../models/general/personal/mysql.personal.repository';
import { MySQLEquipoAccesoRepository } from '../models/general/equipoacceso/mysql.equipo.acceso.repository';
import { multerMiddleware } from '../middlewares/multer.middleware';
import { multerAccessImportArgs } from '../controllers/access/accessConfigMulter';

const mysqlPersonalRepository = new MySQLPersonalRespository();
const mySQLAccesoRepository = new MySQLAccesoRepository();
const mySQLEquipoAccesoRepository = new MySQLEquipoAccesoRepository();

const accesoController = new AccesoController(mySQLAccesoRepository, mysqlPersonalRepository, mySQLEquipoAccesoRepository);

export const accesoRoutes = Router();
// ========== Controlador ==========
accesoRoutes.get('/accesos/json/download', accesoController.getAccessToJson);
accesoRoutes.get('/accesos', authenticate, accesoController.listAccesosOffset);
accesoRoutes.get('/accesos/:a_id', authenticate, accesoController.singleAcceso);

accesoRoutes.post('/accesos/import', authenticate, multerMiddleware(multerAccessImportArgs), accesoController.importAccessData);
accesoRoutes.post('/accesos', authenticate, accesoController.create);

accesoRoutes.delete('/accesos/:a_id', authenticate, accesoController.delete);
accesoRoutes.put('/accesos/:a_id', authenticate, accesoController.update);
