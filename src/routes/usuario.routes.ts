import { Router } from 'express';
import { UserController } from '../controllers/general/user.controller';

import { authenticate } from '../middlewares/auth.middleware';

import { BcryptPasswordHasher } from '../models/general/usuario/security/bycript.password.hasher';
import { MySQLPersonalRespository } from '../models/general/personal/mysql.personal.repository';

import { MySQLUserRepository } from '../models/general/usuario/mysql.user.repository';
import { MySQLRolRepository } from '../models/general/rol/mysql.rol.repository';

const bcryptPasswordHasher = new BcryptPasswordHasher();
const mySQLRolRepository = new MySQLRolRepository();

const mySQLUserRepository = new MySQLUserRepository();
const mysqlPersonalRepository = new MySQLPersonalRespository();

const userController = new UserController(mySQLUserRepository, bcryptPasswordHasher, mysqlPersonalRepository, mySQLRolRepository);

export const usuarioRoutes = Router();
// ========== Controlador ==========

usuarioRoutes.post('/usuarios', authenticate, userController.create);
usuarioRoutes.get('/usuarios/:u_id', authenticate, userController.singleUser);

usuarioRoutes.delete('/usuarios/:u_id', authenticate, userController.delete);
usuarioRoutes.put('/usuarios/:u_id', authenticate, userController.update);
