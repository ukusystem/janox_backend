import dayjs from 'dayjs';
import z from 'zod';

export const createUserNotificationSchema = z.object({
  n_uuid: z
    .string({
      required_error: "'n_uuid' es obligatorio",
      invalid_type_error: "'n_uuid' debe ser una cadena de texto",
    })
    .uuid({ message: "'n_uuid' no es un identificador válido" }),
  nu_id: z
    .string({
      required_error: "'nu_id' es obligatorio",
      invalid_type_error: "'nu_id' debe ser una cadena de texto",
    })
    .uuid({ message: "'nu_id' no es un identificador válido" }),
  fecha_entrega: z
    .string({
      required_error: "'fecha_entrega' es obligatorio",
      invalid_type_error: "'fecha_entrega' debe ser una cadena de texto",
    })
    .refine((val) => dayjs(val, 'YYYY-MM-DD HH:mm:ss', true).isValid(), "'fecha_entrega' inválido o formato incorrecto"),
});

export type CreateUserNotificationBody = z.infer<typeof createUserNotificationSchema>;
