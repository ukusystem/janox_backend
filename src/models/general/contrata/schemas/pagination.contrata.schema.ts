import z from 'zod';

const rubrosSchema = z
  .object({
    rubros: z.array(z.coerce.number({ invalid_type_error: 'rubro_id debe ser un numero' }).int("'rubro_id' debe ser un numero entero").gte(0, "'rubro_id' deber ser mayor o igual a 0")).optional(),
    nombre: z.string().optional(),
  })
  .optional();
export const paginationContrataSchema = z.object({
  limit: z.optional(z.coerce.number({ required_error: "'limit' es requerido", invalid_type_error: "'limit' debe ser un numero" }).int("'limit' debe ser un numero entero").gte(0, "'limit' deber ser mayor o igual a 0")),
  offset: z.optional(z.coerce.number({ required_error: "'offset' es requerido", invalid_type_error: "'offset' debe ser un numero" }).int("'offset' debe ser un numero entero").gte(0, "'offset' deber ser mayor o igual a 0")),
  filters: z.optional(rubrosSchema),
});

export type PaginationContrata = z.infer<typeof paginationContrataSchema>;
