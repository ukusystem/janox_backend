import z from 'zod';

export const accesoParamIdSchema = z.object({
  a_id: z.coerce.number({ required_error: "'a_id' es requerido", invalid_type_error: "'a_id' debe ser un numero" }).int("'a_id' debe ser un numero entero").gt(0, "'a_id' deber ser mayor a 0"),
});
