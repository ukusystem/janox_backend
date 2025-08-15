import z from 'zod';

const filtersSchema = z
  .object({
    state: z.array(z.enum(['1', '2', '3', '4', '16', '17', '18', '21', '22'])).optional(),
    dateRange: z
      .object({
        start: z.string().date(),
        end: z.string().date(),
      })
      .optional(),
    priority: z.enum(['1', '2', '3']).optional(),
  })
  .optional();

export const getRegistroTicketsSchema = z.object(
  {
    ctrl_id: z
      .union([z.string(), z.number()], {
        errorMap: () => {
          return { message: "'ctrl_id' es requerido" };
        },
      })
      .pipe(z.coerce.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    limit: z.optional(z.coerce.number({ required_error: "'limit' es requerido", invalid_type_error: "'limit' debe ser un numero" }).int("'limit' debe ser un numero entero").gte(0, "'limit' debe ser mayor o igual a 0").lte(100, "'limit' debe ser menor o igual a 100")),
    offset: z.optional(z.coerce.number({ required_error: "'offset' es requerido", invalid_type_error: "'offset' debe ser un numero" }).int("'offset' debe ser un numero entero").gte(0, "'offset' debe ser mayor o igual a 0")),
    filters: z.optional(filtersSchema),
  },
  { required_error: "Se requiere incluir el campo 'ctrl_id' en los query params de la consulta" },
);

export type RegistroTicketPagination = z.infer<typeof getRegistroTicketsSchema>;
