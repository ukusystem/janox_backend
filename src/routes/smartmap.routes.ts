import { Router } from 'express';
import { getCamerasInfo, getItemContoller, getEquipoEntradaDisponible, getEquipoSalidaDisponible, getEquiposEntrada, getEquiposSalida } from '../controllers/smartmap';
import { requestValidator } from '../middlewares/validator.middleware';
import { getCamarasInfoSchema, getEquipoEntradaDisponibleSchema, getEquipoEntradaSchema, getEquipoSalidaDisponibleSchema, getEquipoSalidaSchema, smartmapCtrlParamSchema } from '../schemas/smartmap';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { getListControllers } from '../controllers/smartmap/getListControladores';
import { UserRol } from '../types/rol';
import { controllerParamIdSchema } from '../schemas/controller/controllerParamIdSchema';
import { getInputPins } from '../controllers/smartmap/getInputPins';
import { getOutputPins } from '../controllers/smartmap/getOutputPins';

export const smartMapRoutes = Router();

// List Controllers GET "/smartmap/controladores"
smartMapRoutes.get('/smartmap/controladores', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), getListControllers);
// Item Controllere GET "/smartmap/controladores/:ctrl_id"
smartMapRoutes.get('/smartmap/controladores/:ctrl_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: smartmapCtrlParamSchema }), getItemContoller);

// CamarasInfo GET "/smartmap/camarasinfo/:xctrl_id"
smartMapRoutes.get('/smartmap/camarasinfo/:xctrl_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: getCamarasInfoSchema }), getCamerasInfo);

// EquiposEntradaDisponible GET "/smartmap/equiposentrada/:xctrl_id"
smartMapRoutes.get('/smartmap/equiposentrada/:xctrl_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: getEquipoEntradaDisponibleSchema }), getEquipoEntradaDisponible);

// EquiposEntrada GET "/smartmap/equiposentrada/:xctrl_id/:xee_id"
smartMapRoutes.get('/smartmap/equiposentrada/:xctrl_id/:xee_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: getEquipoEntradaSchema }), getEquiposEntrada);

// EquiposSalidaDisponible GET "/smartmap/equipossalida/:xctrl_id"
smartMapRoutes.get('/smartmap/equipossalida/:xctrl_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: getEquipoSalidaDisponibleSchema }), getEquipoSalidaDisponible);

// EquiposSalida GET "/smartmap/equipossalida/:xctrl_id/:xes_id"
smartMapRoutes.get('/smartmap/equipossalida/:xctrl_id/:xes_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: getEquipoSalidaSchema }), getEquiposSalida);

// nuevos

smartMapRoutes.get('/controller/:ctrl_id/input-pins', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: controllerParamIdSchema }), getInputPins);
smartMapRoutes.get('/controller/:ctrl_id/output-pins', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: controllerParamIdSchema }), getOutputPins);
