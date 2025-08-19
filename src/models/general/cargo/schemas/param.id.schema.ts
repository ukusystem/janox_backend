import z from 'zod';
export const cargoParamIdSchema = z.object({
  c_id: z.coerce.number({ required_error: "'c_id' es requerido", invalid_type_error: "'c_id' debe ser un numero" }).int("'c_id' debe ser un numero entero").gt(0, "'c_id' deber ser mayor a 0"),
});
