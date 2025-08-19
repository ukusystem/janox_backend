import { z, TypeOf } from "zod";

export const encryptEnv = z.object({
  ENCRYPT_SALT: z.string(),
  ENCRYPT_SECRET_KEY: z.string(),
});

export interface IEncryptEnv extends TypeOf<typeof encryptEnv> {}