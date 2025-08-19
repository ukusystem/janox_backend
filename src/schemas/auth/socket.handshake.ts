import { z } from 'zod';

export const socketHandShakeSchema = z.object({
  token: z
    .string({
      required_error: 'El token es obligatorio',
      invalid_type_error: 'El token debe ser una cadena de texto',
    })
    .min(1, 'El token no puede estar vacío'),
});
