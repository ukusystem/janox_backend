import { TypeOf, z } from "zod";

export const dbEnv = z.object({
  DB_HOST: z.string().ip().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().max(65535).default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  DB_WAIT_FOR_CONNECTIONS: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  DB_MAX_IDLE: z.coerce.number().int().positive().default(10),
  DB_IDLE_TIMEOUT: z.coerce.number().int().nonnegative().default(60000),
  DB_QUEUE_LIMIT: z.coerce.number().int().nonnegative().default(0),
  DB_ENABLE_KEEP_ALIVE: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
  DB_KEEP_ALIVE_INITIAL_DELAY: z.coerce.number().int().nonnegative().default(0),
});

export interface IDbEnv extends TypeOf<typeof dbEnv> {}
