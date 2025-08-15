import { z } from 'zod';
export const dashboardSharedSchema = z.object(
  {
    ctrl_id: z
      .union([z.string(), z.number()], {
        errorMap: () => {
          return { message: "'ctrl_id' es requerido" };
        },
      })
      .pipe(z.coerce.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    date: z.string({ required_error: "'date' es requerido", invalid_type_error: "'date' debe ser un string" }).regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/g, "'date' es incorrecto."),
    monthly: z.enum(['false', 'true'], {
      errorMap: (_, ctx) => {
        return { message: 'monthly : ' + ctx.defaultError };
      },
    }),
  },
  { required_error: "Se requiere incluir los campos 'ctrl_id','date' y 'monthly'  en los query params de la consulta" },
);

export const dashboardSharedPaginationSchema = z.object(
  {
    ctrl_id: z
      .union([z.string(), z.number()], {
        errorMap: () => {
          return { message: "'ctrl_id' es requerido" };
        },
      })
      .pipe(z.coerce.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    date: z.string({ required_error: "'date' es requerido", invalid_type_error: "'date' debe ser un string" }).regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/g, "'date' es incorrecto."),
    monthly: z.enum(['false', 'true'], {
      errorMap: (_, ctx) => {
        return { message: 'monthly : ' + ctx.defaultError };
      },
    }),
    limit: z.optional(z.coerce.number({ required_error: "'limit' es requerido", invalid_type_error: "'limit' debe ser un numero" }).int("'limit' debe ser un numero entero").gte(0, "'limit' deber ser mayor o igual a 0")),
    offset: z.optional(z.coerce.number({ required_error: "'offset' es requerido", invalid_type_error: "'offset' debe ser un numero" }).int("'offset' debe ser un numero entero").gte(0, "'offset' deber ser mayor o igual a 0")),
  },
  { required_error: "Se requiere incluir los campos 'ctrl_id','date' y 'monthly'  en los query params de la consulta" },
);
