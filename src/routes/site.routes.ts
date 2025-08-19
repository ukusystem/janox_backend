import { Router } from 'express';
import { requestValidator } from '../middlewares/validator.middleware';

import { downloadArchivoCamara, getArchivoCamara } from '../controllers/site/multimedia';
import { getRegistroTemperartura } from '../controllers/site/temperatura';
import { getRegistroTemperaturaSchema } from '../schemas/site/temperatura';
import { getArchivoCamaraSchema } from '../schemas/site/multimedia';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { UserRol } from '../types/rol';

export const siteRoutes = Router();

// ====================== TEMPERATURA ======================
siteRoutes.get('/site/sensortemperatura/registros', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: getRegistroTemperaturaSchema }), getRegistroTemperartura);

// ====================== MULTIMEDIA ======================
// ArchivoCamaraPaths GET "/site/multimedia?ctrl_id=1&date='2024-02-13'&hour=10&tipo=0"
siteRoutes.get('/site/multimedia', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: getArchivoCamaraSchema }), getArchivoCamara);
// DownloadArchivoCamara GET "/site/multimedia/download?filePath=encodeURIComponent"
siteRoutes.get('/site/multimedia/download', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), downloadArchivoCamara);
