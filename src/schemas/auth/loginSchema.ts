import { z } from 'zod';

export const loginSchema = z.object({
  usuario: z.string({ required_error: "'usuario' es requerido", invalid_type_error: "'usuario' debe ser un string" }),
  contraseña: z.string({ required_error: "'contraseña' es requerido", invalid_type_error: "'contraseña' debe ser un string" }).min(5, { message: 'La contraseña debe tener 5 o más caracteres' }),
});
