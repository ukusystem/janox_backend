import { RowDataPacket } from 'mysql2';
import { Nullable } from '../../../types/shared/Nullable';
import { NotificationRepository } from './NotificationRepository';
import { Notification } from './Notification';
import { MySQL2 } from '../../../database/mysql';

interface NotificationRowData extends RowDataPacket, Notification {}

export class MySQLNotificationRepository implements NotificationRepository {
  async findByUuId(n_uuid: string): Promise<Nullable<Notification>> {
    const notifications = await MySQL2.executeQuery<NotificationRowData[]>({ sql: `SELECT * FROM general.notificacion WHERE n_uuid = ? LIMIT 1`, values: [n_uuid] });
    return notifications[0];
  }
}
