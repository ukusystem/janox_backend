import { z } from 'zod';

export const refreshTokenSchema = z.optional(
  z.object({
    refresh_token: z.optional(z.string({ required_error: "'refresh_token' es requerido", invalid_type_error: "'refresh_token' debe ser un texto" })),
  }),
);
