// import dayjs from 'dayjs';
// import z from 'zod';

// export const updateUserNotificationSchema = z.object({
//   n_uuid: z
//     .string({
//       required_error: "'n_uuid' es obligatorio",
//       invalid_type_error: "'n_uuid' debe ser una cadena de texto",
//     })
//     .uuid({ message: "'n_uuid' no es un identificador válido" }),
//   fecha_lectura: z
//     .string({
//       required_error: "'fecha_lectura' es obligatorio",
//       invalid_type_error: "'fecha_lectura' debe ser una cadena de texto",
//     })
//     .refine((val) => dayjs(val, 'YYYY-MM-DD HH:mm:ss', true).isValid(), "'fecha_lectura' inválido o formato incorrecto"),
// });

// export type UpdateUserNotificationBody = z.infer<typeof updateUserNotificationSchema>;
