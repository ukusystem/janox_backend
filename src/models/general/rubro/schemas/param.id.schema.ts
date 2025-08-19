import z from 'zod';
export const rubroParamIdSchema = z.object({
  r_id: z.coerce.number({ required_error: "'r_id' es requerido", invalid_type_error: "'r_id' debe ser un numero" }).int("'r_id' debe ser un numero entero").gt(0, "'r_id' deber ser mayor a 0"),
});
