import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Nullable } from '../../../types/shared/Nullable';
import { CreateUserNotificationDTO } from './dtos/CreateUserNotificationDTO';
import { UpdateUserNotificationDTO } from './dtos/UpdateUserNotificationDTO';
import { UserNofication } from './UserNofication';
import { UserNoficationData, UserNotificationRepository } from './UserNoficationRepository';
import dayjs from 'dayjs';
import { MySQL2 } from '../../../database/mysql';
import { Notification } from '../Notification/Notification';

interface UserNotificationRowData extends RowDataPacket, UserNofication {}
interface UserNotificationFullRowData extends RowDataPacket, UserNofication, Notification {}
interface TotalUserNotificationRowData extends RowDataPacket {
  total: number;
}

export class MySQLUserNotificationRepository implements UserNotificationRepository {
  async readAll(u_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.notificacion_usuario SET fecha_lectura = ? , leido = 1 WHERE u_id = ? AND leido = 0`, values: [dayjs().format('YYYY-MM-DD HH:mm:ss'), u_id] });
  }
  async findByUuId(u_id: number, n_uuid: string): Promise<Nullable<UserNofication>> {
    const userNotifications = await MySQL2.executeQuery<UserNotificationRowData[]>({ sql: `SELECT * FROM general.notificacion_usuario WHERE u_id = ? AND  n_uuid = ? LIMIT 1`, values: [u_id, n_uuid] });
    return userNotifications[0];
  }
  async countTotal(u_id: number): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalUserNotificationRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.notificacion_usuario WHERE u_id = ? `, values: [u_id] });
    return totals[0].total;
  }

  async findByOffsetPagination(u_id: number, limit: number, offset: number, unread?: boolean): Promise<UserNoficationData[]> {
    const contratas = await MySQL2.executeQuery<UserNotificationFullRowData[]>({
      sql: `SELECT nu.* ,n_id ,evento, titulo, mensaje, data, fecha FROM general.notificacion_usuario nu INNER JOIN general.notificacion n ON nu.n_uuid = n.n_uuid AND nu.u_id = ? ${unread ? `AND nu.leido = 0` : ''} ORDER BY n.fecha DESC LIMIT ? OFFSET ?`,
      values: [u_id, limit, offset],
    });

    return contratas.map(({ nu_id, u_id, n_uuid, fecha_creacion, fecha_entrega, fecha_lectura, leido, n_id, evento, titulo, mensaje, data, fecha }) => ({
      nu_id,
      u_id,
      n_uuid,
      fecha_creacion,
      fecha_entrega,
      fecha_lectura,
      leido,
      notificacion: {
        n_id,
        evento,
        titulo,
        mensaje,
        data,
        fecha,
        n_uuid,
      },
    }));
  }
  async create(data: CreateUserNotificationDTO): Promise<UserNofication> {
    const { nu_id, u_id, n_uuid, fecha_entrega } = data;
    const fecha_creacion = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const fecha_lectura = null;
    const leido = 0;
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.notificacion_usuario ( nu_id, u_id, n_uuid, fecha_creacion, fecha_entrega, fecha_lectura, leido ) VALUES ( ? , ? , ? , ? , ? , ? , ? )`, values: [nu_id, u_id, n_uuid, fecha_creacion, fecha_entrega, fecha_lectura, leido] });
    return { nu_id, u_id, n_uuid, fecha_creacion, fecha_entrega, fecha_lectura, leido };
  }
  async update(u_id: number, nu_id: string, fieldsUpdate: UpdateUserNotificationDTO): Promise<void> {
    const keyValueList = Object.entries(fieldsUpdate).filter(([, value]) => value !== undefined);
    const queryValues = keyValueList.reduce<{ setQuery: string; setValues: string[] }>(
      (prev, cur, index, arr) => {
        const result = prev;
        const [key, value] = cur;
        result.setQuery = `${result.setQuery.trim()} ${key} = ? ${index < arr.length - 1 ? ', ' : ''}`;
        result.setValues.push(value);
        return result;
      },
      { setQuery: '', setValues: [] },
    );
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.notificacion_usuario SET ${queryValues.setQuery} WHERE u_id = ? AND  nu_id = ?  LIMIT 1`, values: [...queryValues.setValues, u_id, nu_id] });
  }
  async findById(u_id: number, nu_id: string): Promise<Nullable<UserNofication>> {
    const userNotifications = await MySQL2.executeQuery<UserNotificationRowData[]>({ sql: `SELECT * FROM general.notificacion_usuario WHERE u_id = ? AND  nu_id = ? LIMIT 1`, values: [u_id, nu_id] });
    return userNotifications[0];
  }
  //   async findByUuId(nu_uuid: string): Promise<Nullable<UserNofication>> {
  //     throw new Error('Method not implemented.');
  //   }
}
