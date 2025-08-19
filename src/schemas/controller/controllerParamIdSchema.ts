import z from 'zod';

export const controllerParamIdSchema = z.object({
  ctrl_id: z.coerce.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gt(0, "'ctrl_id' deber ser mayor a 0"),
});
