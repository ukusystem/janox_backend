import z from 'zod';

export const createContrataSchema = z.object({
  r_id: z.number({ required_error: "'r_id' es requerido", invalid_type_error: "'r_id' debe ser un numero" }).int("'r_id' debe ser un numero entero").gt(0, "'r_id' deber ser mayor a 0"),
  contrata: z.string({ required_error: "'contrata' es requerido.", invalid_type_error: "'contrata' debe ser un texto." }).max(100, "'contrata' no puede tener más de 100 caracteres."),
  descripcion: z.string({ required_error: "'descripcion' es requerido.", invalid_type_error: "'descripcion' debe ser un texto." }).max(100, "'descripcion' no puede tener más de 100 caracteres."),
});

export type CreateContrataBody = z.infer<typeof createContrataSchema>;
