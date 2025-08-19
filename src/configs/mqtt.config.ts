import { z } from 'zod';

export const mqttEnv = z.object({
  MQTT_HOST: z.string().default('localhost'),
  MQTT_PORT: z.coerce.number().int().positive().max(65535).default(1883),
  MQTT_ADMIN_USER: z.string(),
  MQTT_ADMIN_PASSWORD: z.string(),
  MQTT_MANAGER_USER: z.string(),
  MQTT_MANAGER_PASSWORD: z.string(),
  MQTT_INVITED_USER: z.string(),
  MQTT_INVITED_PASSWORD: z.string(),
  MQTT_PUBLISH_TIMEOUT: z.coerce.number().int().positive().default(60),
  MQTT_PUBLIC_HOST: z.string(),
  MQTT_PUBLIC_WS_PORT: z.coerce.number().int().positive().max(65535).default(9000),
  MQTT_PUBLIC_WS_PROTOCOL: z.enum(['ws', 'wss']).default('ws'),
});
