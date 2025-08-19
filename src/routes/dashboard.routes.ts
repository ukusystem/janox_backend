import { Router } from 'express';
import {
  accesoTarjetaRemoto,
  activePinEntrada,
  activePinSalida,
  totalEnergyConsumption,
  cameraStates,
  countAlarma,
  totalAssignedCards,
  maxTemperaturaSensor,
  ticketContrata,
  countActiveOutputPins,
  countAcceptedAttendedTickets,
  generalMaxTemperature,
  listUsedCard,
  maxModEnergy,
} from '../controllers/dashboard';
import { requestValidator } from '../middlewares/validator.middleware';
import { dashboardSharedPaginationSchema, dashboardSharedSchema } from '../schemas/dashboard';
import { dashboardStates } from '../controllers/dashboard/dashboardStates';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { UserRol } from '../types/rol';
const dashboardRouter = Router();

dashboardRouter.get('/dashboard/pinentrada', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), activePinEntrada);
dashboardRouter.get('/dashboard/pinsalida', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), activePinSalida);
dashboardRouter.get('/dashboard/camera', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema.omit({ date: true, monthly: true }) }), cameraStates);
dashboardRouter.get('/dashboard/state', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema.omit({ date: true, monthly: true }) }), dashboardStates);
dashboardRouter.get('/dashboard/ticketcontrata', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), ticketContrata);
// dashboardRouter.get("/dashboard/ingresocontrata",authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({query:dashboardSharedSchema}),ingresoContrata)
dashboardRouter.get('/dashboard/temperatura', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), maxTemperaturaSensor);
dashboardRouter.get('/dashboard/acceso', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), accesoTarjetaRemoto);

dashboardRouter.get('/dashboard/total/alarm', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), countAlarma); // cambio /alarma
dashboardRouter.get('/dashboard/total/active-output-pin', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), countActiveOutputPins);
dashboardRouter.get('/dashboard/total/ticket-accepted-attended', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), countAcceptedAttendedTickets);
dashboardRouter.get('/dashboard/total/assigned-card', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), totalAssignedCards); // cambio /tarjeta
dashboardRouter.get('/dashboard/max/temperature-general', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), generalMaxTemperature);
dashboardRouter.get('/dashboard/total/energy-consumption', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), totalEnergyConsumption); // cambio /kwh
dashboardRouter.get('/dashboard/list/used-card', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedPaginationSchema }), listUsedCard);
dashboardRouter.get('/dashboard/max/energy-module', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), maxModEnergy);

export { dashboardRouter };
