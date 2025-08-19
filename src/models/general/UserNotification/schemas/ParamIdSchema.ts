import z from 'zod';

export const userNotificationParamIdSchema = z.object({
  nu_id: z
    .string({
      required_error: "'nu_id' es obligatorio",
      invalid_type_error: "'nu_id' debe ser una cadena de texto",
    })
    .uuid({ message: "'nu_id' no es un identificador válido" }),
});
