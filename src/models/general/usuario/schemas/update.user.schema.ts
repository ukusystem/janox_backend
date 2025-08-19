import z from 'zod';

export const updateUserBodySchema = z.object({
  usuario: z.optional(z.string({ required_error: "'usuario' es requerido", invalid_type_error: "'usuario' debe ser un string" })),
  contraseña: z.optional(z.string({ required_error: "'contraseña' es requerido", invalid_type_error: "'contraseña' debe ser un string" }).min(5, { message: 'La contraseña debe tener 5 o más caracteres' })),
  rl_id: z.optional(z.number({ required_error: "'rl_id' es requerido", invalid_type_error: "'rl_id' debe ser un numero" }).int("'rl_id' debe ser un numero entero.").nonnegative("'rl_id' debe ser un numero no negativo")),
  p_id: z.optional(z.number({ required_error: "'p_id' es requerido", invalid_type_error: "'p_id' debe ser un numero" }).int("'p_id' debe ser un numero entero.").nonnegative("'p_id' debe ser un numero no negativo")),
});

export const updateUserParamSchema = z.object({
  u_id: z.coerce.number({ required_error: "'u_id' es requerido", invalid_type_error: "'u_id' debe ser un numero" }).int("'u_id' debe ser un numero entero").nonnegative("'u_id' debe ser un numero no negativo"),
});

export type UserUuIDParam = z.infer<typeof updateUserParamSchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
