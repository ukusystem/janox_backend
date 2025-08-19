import { z } from 'zod';

export const createUserSchema = z.object(
  {
    usuario: z.string({ required_error: "'usuario' es requerido", invalid_type_error: "'usuario' debe ser un string" }),
    contraseña: z.string({ required_error: "'contraseña' es requerido", invalid_type_error: "'contraseña' debe ser un string" }).min(5, { message: 'La contraseña debe tener 5 o más caracteres' }),
    rl_id: z.number({ required_error: "'rl_id' es requerido", invalid_type_error: "'rl_id' debe ser un numero" }).int("'rl_id' debe ser un numero entero.").nonnegative("'rl_id' debe ser un numero no negativo"),
    p_id: z.number({ required_error: "'p_id' es requerido", invalid_type_error: "'p_id' debe ser un numero" }).int("'p_id' debe ser un numero entero.").nonnegative("'p_id' debe ser un numero no negativo"),
  },
  { required_error: "Datos requeridos : 'usuario' 'contraseña' 'rl_id' 'p_id'", invalid_type_error: 'JSON invalido' },
);

export type CreateUserBody = z.infer<typeof createUserSchema>;
