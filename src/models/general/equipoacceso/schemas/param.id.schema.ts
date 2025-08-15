import z from 'zod';
export const equipoAccesoParamIdSchema = z.object({
  ea_id: z.coerce.number({ required_error: "'ea_id' es requerido", invalid_type_error: "'ea_id' debe ser un numero" }).int("'ea_id' debe ser un numero entero").gt(0, "'ea_id' deber ser mayor a 0"),
});
