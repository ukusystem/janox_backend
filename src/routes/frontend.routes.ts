import { Router } from 'express';
import { resolve } from 'path';
import { CustomError } from '../utils/CustomError';
export const frontEndRoutes = Router();

const allFrontEndPaths = [
  '/',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/forgot-password-success',
  '/dashboard',
  '/register',
  '/site',
  '/site/:ctrl_id/cameras',
  '/site/:ctrl_id/tickets',
  '/site/:ctrl_id/alarms',
  '/site/:ctrl_id/controls',
  '/site/:ctrl_id/access',
  '/site/:ctrl_id/temperature-energy',
  '/vms',
  '/alarm',
  '/ticket',
  '/ticket/create',
  '/temperature',
  '/energy',
  '/company',
  '/access',
  '/detalle-empresa/:co_id',
  '/invitado',
  '/invitado/ticket',
  '/invitado/ticket/create',
];

frontEndRoutes.get(allFrontEndPaths, (req, res, next) => {
  res.sendFile(resolve(__dirname, '../../public/index.html'), (err) => {
    if (err) {
      const errFileNotFound = new CustomError(`index.html no disponible`, 404, 'Not Found');
      next(errFileNotFound);
    }
  });
});
