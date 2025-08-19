import { Router } from 'express';
import { MySQLRubroRepository } from '../models/general/rubro/mysql.rubro.repository';
import { MySQLUserRepository } from '../models/general/usuario/mysql.user.repository';
import { MySQLAccesoRepository } from '../models/general/Acceso/MySQLAccesoRepository';

import { authenticate } from '../middlewares/auth.middleware';
import { ContrataController } from '../controllers/general/contrata.controller';
import { MySQLContrataRepository } from '../models/general/contrata/mysql.contrata.repository';
import { MySQLPersonalRespository } from '../models/general/personal/mysql.personal.repository';
const mysqlContrataRepository = new MySQLContrataRepository();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mySQLRubroRepository = new MySQLRubroRepository();
const mySQLUserRepository = new MySQLUserRepository();
const mySQLAccesoRepository = new MySQLAccesoRepository();

const contrataController = new ContrataController(mysqlContrataRepository, mySQLRubroRepository, mysqlPersonalRepository, mySQLUserRepository, mySQLAccesoRepository);

export const contrataRoutes = Router();
// ========== Controlador ==========

contrataRoutes.get('/contratas', authenticate, contrataController.listContratasOffset);
contrataRoutes.post('/contratas', authenticate, contrataController.create);
contrataRoutes.get('/contratas/:co_id', authenticate, contrataController.singleContrata);
contrataRoutes.delete('/contratas/:co_id', authenticate, contrataController.delete);
contrataRoutes.put('/contratas/:co_id', authenticate, contrataController.update);
