import { Nullable } from '../../../types/shared/Nullable';
import { Notification } from './Notification';

export interface NotificationRepository {
  findByUuId(n_uuid: string): Promise<Nullable<Notification>>;
}
