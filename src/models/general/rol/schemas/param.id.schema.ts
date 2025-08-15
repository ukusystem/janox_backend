import z from 'zod';
export const rolParamIdSchema = z.object({
  rl_id: z.coerce.number({ required_error: "'rl_id' es requerido", invalid_type_error: "'rl_id' debe ser un numero" }).int("'rl_id' debe ser un numero entero").gt(0, "'rl_id' deber ser mayor a 0"),
});
