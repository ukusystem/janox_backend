import { Router } from 'express';
import { cameraController } from '../controllers/camera';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { requestValidator } from '../middlewares/validator.middleware';
import { cameraControlSchema, cameraPresetSchema, cameraSnapshotSchema } from '../schemas/camera';
import { UserRol } from '../types/rol';

export const cameraRoutes = Router();

// Control  GET /camera/control?ctrl_id=number&cmr_id=number&action=start&movement=Right&velocity=0.5
cameraRoutes.get('/camera/control', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: cameraControlSchema }), cameraController.getControlOnvif);

// PresetFunction GET /camera/preset?ctrl_id=number&cmr_id=number&preset=number
cameraRoutes.get('/camera/preset', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: cameraPresetSchema }), cameraController.getPresetOnvif);

//Snapshot GET /camera/snapshot?ctrl_id=number&cmr_id=number
cameraRoutes.get('/camera/snapshot', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: cameraSnapshotSchema }), cameraController.getSnapshot);

// All Cameras GET /cameras
cameraRoutes.get('/cameras', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), cameraController.getAllCameras);

// CamarasPorCtrlID GET /camera/:xctrl_id
cameraRoutes.get('/camera/:xctrl_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), cameraController.getCameraByCtrlId);
