import { z, TypeOf } from 'zod';

export const jwtEnv = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRE: z.coerce
    .number()
    .positive()
    .default(60 * 1000), // 1m
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRE: z.coerce
    .number()
    .positive()
    .default(24 * 60 * 60 * 1000), // 1d,
  ENCRYPT_TOKEN_SECRET: z.string(),
});

export interface IJwtEnv extends TypeOf<typeof jwtEnv> {}
