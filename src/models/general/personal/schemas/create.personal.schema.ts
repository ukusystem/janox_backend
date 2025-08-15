import z from 'zod';

export const createPersonalSchema = z.object({
  nombre: z.string({ required_error: "'nombre' es requerido.", invalid_type_error: "'nombre' debe ser un texto." }).max(30, "'nombre' no puede tener más de 30 caracteres."),
  apellido: z.string({ required_error: "'apellido' es requerido.", invalid_type_error: "'apellido' debe ser un texto." }).max(30, "'apellido' no puede tener más de 30 caracteres."),
  telefono: z.string({ required_error: "'telefono' es requerido.", invalid_type_error: "'telefono' debe ser un texto." }).regex(/^\d{9,20}$/, "'telefono' incorrecto , debe tener entre 9 y 20 caracteres."),
  dni: z.string({ required_error: "'dni' es requerido", invalid_type_error: "'dni' debe ser un texto" }).regex(/^\d{8,12}$/, "dni' incorrecto, debe tener entre 8 y 12 caracteres."),
  c_id: z.number({ required_error: "'c_id' es requerido", invalid_type_error: "'c_id' debe ser un numero" }).int("'c_id' debe ser un numero entero").gt(0, "'c_id' deber ser mayor a 0"),
  co_id: z.number({ required_error: "'co_id' es requerido", invalid_type_error: "'co_id' debe ser un numero" }).int("'co_id' debe ser un numero entero").gt(0, "'co_id' deber ser mayor a 0"),
  // foto: string
  correo: z
    .string({ required_error: "'correo' es requerido", invalid_type_error: "'correo' debe ser un texto" })
    .regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, "'correo' incorrecto.")
    .max(100, "'correo' no puede tener mas de 100 caracteres."),
});
