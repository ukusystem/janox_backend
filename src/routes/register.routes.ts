import { Router } from 'express';
import { registerController } from '../controllers/register';
import { requestValidator } from '../middlewares/validator.middleware';
import { downloadRegistersSchema, getRegistersSchema } from '../schemas/register';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { UserRol } from '../types/rol';

export const registerRoutes = Router();

// Registros GET /register?type=""&ctrl_id=1&start_date=""&end_date=""&cursor=""&limit="" & ...others...
registerRoutes.get('/register', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: getRegistersSchema }), registerController.getRegistersFinal);

// DownloadExcel GET /register/download/excel
registerRoutes.get('/register/download/excel', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: downloadRegistersSchema }), registerController.excelDownload);

// DownloadCSV GET /register/download/csv
registerRoutes.get('/register/download/csv', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: downloadRegistersSchema }), registerController.csvDownload);

// DownloadPDF POST /register/download/pdf
// registerRoutes.post("/register/download/pdf",registerController.pdfDownload)
