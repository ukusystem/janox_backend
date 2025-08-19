import { Router } from 'express';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { requestValidator } from '../middlewares/validator.middleware';
import { getPreferencias, createPreferencia, updatePreferencia, deletePreferencia, trimRecordNvr, getPlayListNvr, getSegmentNvr } from '../controllers/vms';
import { createPreferenciaSchema, updatePreferenciaSchema, deletePreferenciaSchema, trimRecordSchema, nvrSchema } from '../schemas/vms';
import { UserRol } from '../types/rol';

export const vmsRoutes = Router();

// getPreferencias GET "/vms/preferencia"
vmsRoutes.get('/vms/preferencia', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), getPreferencias);

// CrearPreferencia POST "/vms/preferencia"
vmsRoutes.post('/vms/preferencia', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: createPreferenciaSchema }), createPreferencia);

// UpdatePreferencia PUT "/vms/preferencia"
vmsRoutes.put('/vms/preferencia', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: updatePreferenciaSchema }), updatePreferencia);

// DeletePreferencia DELETE "/vms/preferencia/:xprfvms_id"
vmsRoutes.delete('/vms/preferencia/:xprfvms_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: deletePreferenciaSchema }), deletePreferencia);

// TrimRecordNvr GET /vms/trimrecord?ctrl_id=number&cmr_id=number&date=string&startTime=string&endTime=string
vmsRoutes.get('/vms/trimrecord', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: trimRecordSchema }), trimRecordNvr);

// PlayList GET /vms/:ctrl_id/:cmr_id/:date/index.m3u8
vmsRoutes.get('/vms/:ctrl_id/:cmr_id/:date/index.m3u8', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: nvrSchema }), getPlayListNvr);

// Segment GET /vms/:ctrl_id/:cmr_id/:date/record/:segment_name
vmsRoutes.get('/vms/:ctrl_id/:cmr_id/:date/record/:segment_name', requestValidator({ params: nvrSchema }), getSegmentNvr);
