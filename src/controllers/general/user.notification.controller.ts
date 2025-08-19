import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { CreateEntityResponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';
import { UserNoficationData, UserNotificationRepository } from '../../models/general/UserNotification/UserNoficationRepository';
import { PaginationUserNotification } from '../../models/general/UserNotification/schemas/PaginationUserNotificationSchema';
import { RequestWithUser } from '../../types/requests';
import { UserNofication } from '../../models/general/UserNotification/UserNofication';
import { CreateUserNotificationBody } from '../../models/general/UserNotification/schemas/CreateUserNotificationSchema';
import { NotificationRepository } from '../../models/general/Notification/NotificationRepository';
import dayjs from 'dayjs';

export class UserNoficationController {
  constructor(
    private readonly user_notification_repository: UserNotificationRepository,
    private readonly notification_repository: NotificationRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const userNotificationDTO: CreateUserNotificationBody = req.body;

      const notificationFound = await this.notification_repository.findByUuId(userNotificationDTO.n_uuid);
      if (!notificationFound) {
        return res.status(404).json({ success: false, message: `Notificacion no diponible.` });
      }

      const userNotification = await this.user_notification_repository.findByUuId(user.u_id, notificationFound.n_uuid);

      if (userNotification) {
        return res.status(202).json({ success: true, message: `La notificacion ya se encuentra registrado` });
      }

      const newUserNotification = await this.user_notification_repository.create({ ...userNotificationDTO, u_id: user.u_id });

      const response: CreateEntityResponse = {
        id: newUserNotification.nu_id,
        message: 'Notificacion de usuario creado satisfactoriamente',
      };

      res.status(201).json(response);
    });
  }
  get setNotificationRead() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { nu_id } = req.params as { nu_id: string };

      const userNotificationFound = await this.user_notification_repository.findById(user.u_id, nu_id);
      if (!userNotificationFound) {
        return res.status(404).json({ success: false, message: `Notificacion de usuario no diponible.` });
      }

      await this.user_notification_repository.update(user.u_id, userNotificationFound.nu_id, { fecha_lectura: dayjs().format('YYYY-MM-DD HH:mm:ss'), leido: 1 });

      const response: UpdateResponse<UserNofication> = {
        message: 'La notificación ha sido marcada como leída.',
      };

      return res.status(200).json(response);
    });
  }
  get readAllNotification() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      await this.user_notification_repository.readAll(user.u_id);

      const response: UpdateResponse<UserNofication> = {
        message: 'Todas las notificaciónes han sido marcadas como leída.',
      };

      return res.status(200).json(response);
    });
  }

  get listOffsetPagination() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const { offset, limit, unread } = req.query as PaginationUserNotification;

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const userNotifications = await this.user_notification_repository.findByOffsetPagination(user.u_id, final_limit, final_offset, unread === 'true');
      // const total = await this.user_notification_repository.countTotal(user.u_id);

      const response: OffsetPaginationResponse<UserNoficationData> = {
        data: userNotifications,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: userNotifications.length,
          totalCount: 0,
        },
      };

      return res.json(response);
    });
  }

  get item() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const { nu_id } = req.params as { nu_id: string };
      const userNotification = await this.user_notification_repository.findById(user.u_id, nu_id);
      if (!userNotification) {
        return res.status(400).json({ success: false, message: 'Notificacion de usuario no disponible' });
      }
      const response: EntityResponse<UserNofication> = userNotification;
      res.status(200).json(response);
    });
  }
}
