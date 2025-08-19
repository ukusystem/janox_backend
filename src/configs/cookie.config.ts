import { z, TypeOf } from 'zod';

export const cookieEnv = z.object({
  COOKIE_ACCESS_TOKEN_NAME: z.string().default('ukus_token'),
  COOKIE_REFRESH_TOKEN_NAME: z.string().default('ukus_refresh_token'),
});

export interface ICookieEnv extends TypeOf<typeof cookieEnv> {}
