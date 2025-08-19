import z from 'zod';

export const updateContrataBodySchema = z.object({
  r_id: z.optional(z.number({ required_error: "'r_id' es requerido", invalid_type_error: "'r_id' debe ser un numero" }).int("'r_id' debe ser un numero entero").gt(0, "'r_id' deber ser mayor a 0")),
  contrata: z.optional(z.string({ required_error: "'contrata' es requerido.", invalid_type_error: "'contrata' debe ser un texto." }).max(100, "'contrata' no puede tener más de 100 caracteres.")),
  descripcion: z.optional(z.string({ required_error: "'descripcion' es requerido.", invalid_type_error: "'descripcion' debe ser un texto." }).max(100, "'descripcion' no puede tener más de 100 caracteres.")),
});

export const updateContrataParamSchema = z.object({
  co_id: z.coerce.number({ required_error: "'co_id' es requerido", invalid_type_error: "'co_id' debe ser un numero" }).int("'co_id' debe ser un numero entero").gt(0, "'co_id' deber ser mayor a 0"),
});

export type UpdateContrataBody = z.infer<typeof updateContrataBodySchema>;
export type ContrataIDParam = z.input<typeof updateContrataParamSchema>;
