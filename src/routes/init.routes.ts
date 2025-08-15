import { Router } from 'express';
import { getControladores } from '../controllers/init';
import { authenticate } from '../middlewares/auth.middleware';

export const initRoutes = Router();

//Controladores GET /api/v1/app/controlador
initRoutes.get('/app/controlador', authenticate, getControladores);
