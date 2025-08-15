import { z } from 'zod';

export const mqttEnv = z.object({
  MQTT_HOST: z.string().default('localhost'),
  MQTT_PORT: z.coerce.number().int().positive().max(65535).default(1883),
  MQTT_PORT_WS: z.coerce.number().int().positive().max(65535).default(9000),
  MQTT_ADMIN_USER: z.string(),
  MQTT_ADMIN_PASSWORD: z.string(),
  MQTT_MANAGER_USER: z.string(),
  MQTT_MANAGER_PASSWORD: z.string(),
  MQTT_INVITED_USER: z.string(),
  MQTT_INVITED_PASSWORD: z.string(),
  MQTT_PUBLISH_TIMEOUT: z.coerce.number().int().positive().default(60),
});
