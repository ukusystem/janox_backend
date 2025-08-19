import mqtt, { MqttClient } from 'mqtt';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { genericLogger } from '../loggers';
import { appConfig } from '../../configs';
import { UserRol } from '../../types/rol';
import { ResultSetHeader } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { Notification } from '../../models/general/Notification/Notification';

interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface NotificationPayload {
  id?: string;
  u_id?: number;
  evento: string;
  titulo: string;
  mensaje: string;
  fecha?: string;
  data?: Record<string, unknown>; // Datos adicionales que puedes enviar
}

export class MqttService {
  private readonly client: MqttClient;
  private readonly BASE_TOPIC: string = 'notifications';
  private canPublish = false;
  private pendingNotifications: Map<string, { notification: Omit<Notification, 'n_id'>; topics: string[] }> = new Map();

  constructor(config: MqttConfig) {
    this.client = mqtt.connect(`mqtt://${config.host}`, { port: config.port, username: config.username, password: config.password });
    this.client.on('connect', () => {
      genericLogger.info('MqttService | Conectado al broker MQTT');
    });
    this.client.on('error', (error) => {
      genericLogger.error(`MqttService Error : ${error.message} `, error);
    });

    setTimeout(() => {
      genericLogger.info('MqttService | Disponible para emitir notificaciones.');
      this.canPublish = true;
      this.#publisPendingNotifications();
    }, appConfig.mqtt.publish_timeout * 1000);
  }

  async #saveNotification(payload: Omit<Notification, 'n_id'>): Promise<void> {
    const { n_uuid, evento, titulo, mensaje, data, fecha } = payload;
    await MySQL2.executeQuery<ResultSetHeader>({
      sql: `INSERT INTO general.notificacion ( n_uuid, evento, titulo, mensaje, data, fecha ) VALUES ( ? , ? , ? , ? , ? , ? )`,
      values: [n_uuid, evento, titulo, mensaje, JSON.stringify(data), fecha],
    });
  }

  #publisPendingNotifications() {
    const notifications = Array.from(this.pendingNotifications.values());
    notifications.forEach(({ notification, topics }) => {
      this.#publishNotification(notification, topics);
    });
    this.pendingNotifications.clear();
  }

  async #publishNotification(notification: Omit<Notification, 'n_id'>, topics: Array<string>, confirm?: boolean) {
    if (!this.canPublish) {
      if (confirm) {
        this.pendingNotifications.set(notification.n_uuid, { notification: notification, topics: topics });
      }
      return;
    }
    try {
      if (this.client.connected) {
        await this.#saveNotification(notification);
        topics.forEach((topic) => {
          this.client.publish(topic, JSON.stringify(notification), { qos: 1, retain: true }, async (error) => {
            if (error) {
              genericLogger.error(`MqttService | Error al enviar notificación : ${error.message} `, error);
            } else {
              genericLogger.debug(`MqttService | Notificación enviada | Topic "${topic}" | ${JSON.stringify(notification)} `);
            }
          });
        });
      }
    } catch (error) {
      genericLogger.error(`MqttService | Error al publicar notificación`, error);
    }
  }

  public publisAdminNotification(payload: NotificationPayload, confirm?: boolean) {
    const topic = this.getAdminTopic();

    const newNotification: Omit<Notification, 'n_id'> = {
      n_uuid: payload.id ?? uuid(),
      evento: payload.evento,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: payload.data,
    };
    this.#publishNotification(newNotification, [topic], confirm);
  }
  public publisContrataNotification(payload: NotificationPayload, co_id: number, confirm?: boolean) {
    const topicContrata = this.getContrataTopic(co_id);
    const topicAdmin = this.getAdminTopic();

    const newNotification: Omit<Notification, 'n_id'> = {
      n_uuid: payload.id ?? uuid(),
      evento: payload.evento,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: payload.data,
    };
    this.#publishNotification(newNotification, [topicContrata, topicAdmin], confirm);
  }

  public static getUserCredentials(rol_id: number) {
    if (rol_id === UserRol.Administrador || rol_id === UserRol.Administrador) {
      return {
        user: appConfig.mqtt.users.manager.user,
        password: appConfig.mqtt.users.manager.password,
      };
    }

    if (rol_id === UserRol.Invitado) {
      return {
        user: appConfig.mqtt.users.invited.user,
        password: appConfig.mqtt.users.invited.password,
      };
    }
    return null;
  }

  private getAdminTopic() {
    return `${this.BASE_TOPIC}/admin`;
  }

  private getContrataTopic(co_id: number) {
    return `${this.BASE_TOPIC}/contrata/${co_id}`;
  }
}

const mqttService = new MqttService({ host: appConfig.mqtt.host, port: appConfig.mqtt.port, username: appConfig.mqtt.users.admin.user, password: appConfig.mqtt.users.admin.password });

export { mqttService };
