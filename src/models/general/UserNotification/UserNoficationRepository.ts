import { Nullable } from '../../../types/shared/Nullable';
import { Notification } from '../Notification/Notification';
import { CreateUserNotificationDTO } from './dtos/CreateUserNotificationDTO';
import { UpdateUserNotificationDTO } from './dtos/UpdateUserNotificationDTO';
import { UserNofication } from './UserNofication';

export interface UserNoficationData extends UserNofication {
  notificacion: Notification;
}
export interface UserNotificationRepository {
  create(data: CreateUserNotificationDTO): Promise<UserNofication>;
  update(u_id: number, nu_id: string, fieldsUpdate: UpdateUserNotificationDTO): Promise<void>;
  findById(u_id: number, nu_id: string): Promise<Nullable<UserNofication>>;
  findByUuId(u_id: number, n_uuid: string): Promise<Nullable<UserNofication>>;
  findByOffsetPagination(u_id: number, limit: number, offset: number, unread?: boolean): Promise<UserNoficationData[]>;
  countTotal(u_id: number): Promise<number>;
  readAll(u_id: number): Promise<void>;
}
