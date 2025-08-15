import { Router } from 'express';
import {
  createTicketController,
  downloadArchivo,
  downloadArchivoRespaldo,
  downloadFotoActividadPersonal,
  downloadPdfDetalles,
  downloadZip,
  getCargos,
  getContratas,
  getFotoActividadPersonal,
  getNodos,
  getPersonalContrata,
  getRegistroTicket,
  getRegistroTickets,
  getSingleRegistroTicket,
  getTicketDetalles,
  getTipoTrabajo,
  multerCreateTicketConfig,
  multerUpdateFilesTicketConfig,
  upadateTicket,
  updateArchivoRespaldo,
} from '../controllers/ticket';
import { requestValidator } from '../middlewares/validator.middleware';
import {
  downloadArchivoRespaldoSchema,
  downloadArchivoSchema,
  downloadFotoActividadPersonalSchema,
  downloadPdfDetallesSchema,
  downloadZipSchema,
  getFotoActividadPersonalSchema,
  getPersonalContrataSchema,
  getRegistroTicketSchema,
  getRegistroTicketsSchema,
  getSingleRegTickParam,
  getSingleRegTickQuery,
  getTicketDetallesSchema,
  updateTicketSchema,
} from '../schemas/ticket';
import { authenticate } from '../middlewares/auth.middleware';
import { multerMiddleware } from '../middlewares/multer.middleware';

export const ticketRoutes = Router();

// Create POST /ticket/formdata
ticketRoutes.post('/ticket/create', authenticate, multerMiddleware(multerCreateTicketConfig), createTicketController); // validado

// TipoTrabajo GET "/ticket/tipotrabajo"
ticketRoutes.get('/ticket/tipotrabajo', authenticate, getTipoTrabajo); // no necesita validar

// PersonalContrata GET "/ticket/personal/:xco_id"
ticketRoutes.get('/ticket/personalescontrata/:xco_id', authenticate, requestValidator({ params: getPersonalContrataSchema }), getPersonalContrata);

// UpadateTicket PATCH "/ticket/action"
ticketRoutes.patch('/ticket/update', authenticate, requestValidator({ body: updateTicketSchema }), upadateTicket);

// RegionNodos GET "/ticket/nodos"
ticketRoutes.get('/ticket/nodos', authenticate, getNodos); // no necesita validar

// RegistroTicketNodo GET "/ticket/registro/:xctrl_id"
ticketRoutes.get('/ticket/registro/:xctrl_id', authenticate, requestValidator({ params: getRegistroTicketSchema }), getRegistroTicket);

// Cargos GET "/ticket/cargos"
ticketRoutes.get('/ticket/cargos', authenticate, getCargos); // no necesita validar

// Contratas GET "/ticket/contratas"
ticketRoutes.get('/ticket/contratas', authenticate, getContratas);

// Download ZIP GET /ticket/{rt_id}/download-zip?ctrl_id=1
ticketRoutes.get('/ticket/:rt_id/download-zip', authenticate, requestValidator({ params: downloadZipSchema.omit({ ctrl_id: true }), query: downloadZipSchema.omit({ rt_id: true }) }), downloadZip);

// ======================= Nuevos
// Registro Tickets GET "/ticket/registros?ctrl_id=number&limit=number&offset=number"
ticketRoutes.get('/ticket/registros', authenticate, requestValidator({ query: getRegistroTicketsSchema }), getRegistroTickets);

// SingleRegistroTicket GET "/ticket/registros/:rt_id?ctrl_id=number"
ticketRoutes.get('/ticket/registros/:rt_id', authenticate, requestValidator({ params: getSingleRegTickParam, query: getSingleRegTickQuery }), getSingleRegistroTicket);

// ================= Detalles ===============

// Ticket Detalles GET "/ticket/detalles?rt_id=number&ctrl_id=number"
ticketRoutes.get('/ticket/detalles', authenticate, requestValidator({ query: getTicketDetallesSchema }), getTicketDetalles);

// FotoActividadPersonal GET "/ticket/fotoactividadpersonal?path:encodeURIComponennt"
ticketRoutes.get('/ticket/fotoactividadpersonal', authenticate, requestValidator({ query: getFotoActividadPersonalSchema }), getFotoActividadPersonal);
ticketRoutes.get('/user/foto', authenticate, requestValidator({ query: getFotoActividadPersonalSchema }), getFotoActividadPersonal);

// DownloadArchivo POST "/ticket/download/archivo"
ticketRoutes.post('/ticket/download/archivo', authenticate, requestValidator({ body: downloadArchivoSchema }), downloadArchivo);

// UpdateArchivosRespaldo POST "/ticket/update/archivorespaldo"
ticketRoutes.post('/ticket/update/archivorespaldo', authenticate, multerMiddleware(multerUpdateFilesTicketConfig), updateArchivoRespaldo);

// DownloadPdfDetalles GET "/ticket/download?rt_id=number&ctrl_id=number"
ticketRoutes.get('/ticket/download', authenticate, requestValidator({ query: downloadPdfDetallesSchema }), downloadPdfDetalles);

// Download ArchivoRespaldo GET "/ticket/download/archivorespaldo?filePath=encodeURIComponennt"
ticketRoutes.get('/ticket/download/archivorespaldo', requestValidator({ query: downloadArchivoRespaldoSchema }), downloadArchivoRespaldo);
// Download ArchivoRespaldo GET "/ticket/download/fotoactividadpersonal?filePath=encodeURIComponennt"
ticketRoutes.get('/ticket/download/fotoactividadpersonal', authenticate, requestValidator({ query: downloadFotoActividadPersonalSchema }), downloadFotoActividadPersonal);
