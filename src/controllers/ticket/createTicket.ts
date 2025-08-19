import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { createTicketSchema } from '../../schemas/ticket/createTicketSchema';
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import { getFormattedDate } from '../../utils/getFormattedDateTime';
import { v4 as uuidv4 } from 'uuid';
import { getExtesionFile } from '../../utils/getExtensionFile';

import { Ticket, Personal, Solicitante } from '../../models/controllerapp/src/ticket';
import { onFinishTicket, onTicket } from '../../models/controllerapp/controller';
import { genericLogger } from '../../services/loggers';
import { RequestWithUser } from '../../types/requests';
import { TicketScheduleManager } from '../socket/ticket.schedule/ticket.schedule.manager';
import { RegistroTicketObj } from '../socket/ticket.schedule/ticket.schedule.types';
import { TicketState } from '../../types/ticket.state';
import { UserRol } from '../../types/rol';
import { FinishTicket } from '../../models/controllerapp/src/finishTicket';
import { mqttService } from '../../services/mqtt/MqttService';

import { ensureDirExists, moveFile, toPosixPath } from '../../utils/file';
import { deleteTemporalFilesMulter, MulterMiddlewareConfig } from '../../middlewares/multer.middleware';
import { generateThumbs } from '../../models/controllerapp/src/frontTools';
import { ControllerMapManager } from '../../models/maps';

enum TicketFormKeys {
  Formulario = 'formulario',
  ArchivoRespaldo = 'archivo_respaldo',
  FotoPersonal = 'foto_personal',
}
const basePhotoRelativeDir = './archivos/personal'; // PersonalController.BASE_PROFILEPHOTO_RELATIVE_DIR
const basePersonalActivityDir = `${basePhotoRelativeDir}/pesonal_activity`;

export const multerCreateTicketConfig: MulterMiddlewareConfig = {
  bodyFields: [TicketFormKeys.Formulario],
  fieldConfigs: [
    { field: { name: TicketFormKeys.ArchivoRespaldo, maxCount: 5 }, allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], maxFileSize: 10 * 1024 * 1024 },
    { field: { name: TicketFormKeys.FotoPersonal }, allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'], maxFileSize: 5 * 1024 * 1024 },
  ],
  limits: {
    // files: 5, // máximo 5 archivos binarios en total (suma de todos los campos)
    fileSize: 10 * 1024 * 1024, // tamaño máximo por archivo binario: 10MB
    fieldSize: 5 * 1024 * 1024, // tamaño máximo por campo de texto (ej: 'formulario'): 5MB
  },
};

export interface TicketForm {
  solicitante: Solicitante;
  personales: Personal[];
}

const copyDefaultAvatar = (destination: string) => {
  ensureDirExists(path.dirname(destination));
  const sourceDefault = path.resolve('./assets/default.user.avatar.png');
  fs.copyFileSync(sourceDefault, destination);
};

export const createTicketController = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const user = req.user;
  if (user === undefined) {
    return res.status(401).json({ message: 'UNAUTHORIZED' });
  }

  const cleanUp = () => {
    if (req.files) {
      deleteTemporalFilesMulter(req.files);
    }
  };

  let parsedFormulario;
  try {
    parsedFormulario = JSON.parse(req.body[TicketFormKeys.Formulario]);
  } catch {
    cleanUp();
    return res.status(400).json({
      status: 400,
      message: `El campo '${TicketFormKeys.Formulario}' no contiene un JSON válido.`,
    });
  }

  const result = createTicketSchema.safeParse(parsedFormulario);
  if (!result.success) {
    cleanUp();
    return res.status(400).json(
      result.error.errors.map((errorDetail) => ({
        message: errorDetail.message,
        status: errorDetail.code,
      })),
    );
  }

  const formDataValid = result.data;

  const {
    solicitante: { fechacomienzo, fechatermino, ctrl_id },
  } = formDataValid;

  const currentDateUnix = dayjs().unix();
  const currentDate = dayjs.unix(currentDateUnix).format('YYYY-MM-DD HH:mm:ss');
  const fechacomienzoDate = dayjs.unix(fechacomienzo).format('YYYY-MM-DD HH:mm:ss');

  if (fechacomienzo < currentDateUnix) {
    cleanUp();
    return res.status(400).json({ error: 'Fecha de comienzo incorrecta', message: `La fecha comienzo '${fechacomienzoDate}' debe ser mayor a la hora actual '${currentDate}'` });
  }

  const fechaterminoDate = dayjs.unix(fechatermino).format('YYYY-MM-DD HH:mm:ss');
  if (fechatermino < fechacomienzo) {
    cleanUp();
    return res.status(400).json({ error: 'Fecha termino incorrecta', message: `La fecha termino '${fechaterminoDate}' debe ser mayor a la fecha comienzo '${fechacomienzoDate}'` });
  }

  //Cuando todo es correcto:
  const fileUploaded = req.files;

  const archivosData: { ruta: string; nombreoriginal: string; tipo: string; tamaño: number; thumbnail: string | null }[] = [];
  let personales = formDataValid.personales;

  if (fileUploaded && !Array.isArray(fileUploaded)) {
    const archivoRespaldo = fileUploaded[TicketFormKeys.ArchivoRespaldo];

    if (archivoRespaldo) {
      for (const file of archivoRespaldo) {
        const dateFormat = getFormattedDate();
        const nameFileUuid = uuidv4();
        const extensionFile = getExtesionFile(file.originalname);

        const movePath = path.resolve(`./archivos/ticket/nodo${ctrl_id}/${dateFormat}/${nameFileUuid}.${extensionFile}`);

        moveFile(file.path, movePath);

        let thumbnailPathResult: string | null = null;
        try {
          const thumbnailPath = path.resolve(`./archivos/ticket/nodo${ctrl_id}/${dateFormat}/${nameFileUuid}_thumbnail.jpg`);
          ensureDirExists(path.dirname(thumbnailPath));
          const { result, thumbBase64 } = await generateThumbs({ filepath: movePath, type: file.mimetype });

          if (result) {
            const imageBuffer = Buffer.from(thumbBase64, 'base64');
            fs.writeFileSync(thumbnailPath, imageBuffer);
            thumbnailPathResult = toPosixPath(path.relative('./archivos/ticket', thumbnailPath));
          }
        } catch (error) {
          genericLogger.error(`Error al generar y guardar el thumbnail para el archivo "${file.originalname}" (tipo: ${file.mimetype}) `, error);
        }

        const relativePath = toPosixPath(path.relative('./archivos/ticket', movePath));

        archivosData.push({
          ruta: relativePath,
          nombreoriginal: file.originalname,
          tipo: file.mimetype,
          tamaño: file.size,
          thumbnail: thumbnailPathResult,
        });
      }
    }

    const photosUpload = fileUploaded[TicketFormKeys.FotoPersonal];

    if (photosUpload) {
      personales = personales.map((personal, index) => {
        if (!personal.isNew) return personal;

        const fileItem = photosUpload[index];

        if (fileItem) {
          const nameFileUuid = uuidv4();
          const extensionFile = getExtesionFile(fileItem.originalname);
          const movePath = path.resolve(basePersonalActivityDir, `${nameFileUuid}.${extensionFile}`);

          moveFile(fileItem.path, movePath);

          const relativePath = toPosixPath(path.relative(basePhotoRelativeDir, movePath));
          return { ...personal, foto: relativePath };
        } else {
          const newFileName = uuidv4();
          const destPath = path.resolve(basePersonalActivityDir, `${newFileName}.png`);

          copyDefaultAvatar(destPath);

          const relativePath = toPosixPath(path.relative(basePhotoRelativeDir, destPath));
          return { ...personal, foto: relativePath };
        }
      });
    }
  }

  try {
    const newTicket = new Ticket(archivosData, { ...formDataValid.solicitante }, personales);
    const response = await onTicket(newTicket);
    if (response === undefined) {
      cleanUp();
      return res.status(500).json({ success: false, message: 'Internal Server Error,Backend-Technician' });
    }

    if (!response.resultado) {
      cleanUp();
      return res.status(500).json({ success: false, message: response.mensaje });
    }

    // success
    const stateTicket = user.rl_id === UserRol.Administrador || user.rl_id === UserRol.Gestor ? TicketState.Aceptado : TicketState.Esperando;

    await onFinishTicket(new FinishTicket(stateTicket, ctrl_id, response.id)); // update ticket

    const newTicketObj: RegistroTicketObj = { ...formDataValid.solicitante, rt_id: response.id, estd_id: stateTicket };
    TicketScheduleManager.add(ctrl_id, newTicketObj);
    if (user.rl_id === UserRol.Invitado) {
      const controllerSite = ControllerMapManager.getController(ctrl_id);
      mqttService.publisAdminNotification({
        evento: 'ticket.requested',
        titulo: 'Nueva Solicitud de Ticket',
        mensaje: `Se ha solicitado un nuevo ticket (#${response.id}) por la contrata "${user.contrata}", para el nodo '${controllerSite?.nodo ?? ctrl_id}'.`,
      });
    }
    return res.json({ success: true, message: 'Ticket creado correctamente.' });
  } catch (error) {
    cleanUp();
    genericLogger.error('Create Ticket Backend-Technician', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error,Backend-Technician' });
  }
});
