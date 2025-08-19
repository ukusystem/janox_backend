import z from 'zod';

export const paginationUserNotificationSchema = z.object({
  limit: z.optional(z.coerce.number({ required_error: "'limit' es requerido", invalid_type_error: "'limit' debe ser un numero" }).int("'limit' debe ser un numero entero").gte(0, "'limit' deber ser mayor o igual a 0")),
  offset: z.optional(z.coerce.number({ required_error: "'offset' es requerido", invalid_type_error: "'offset' debe ser un numero" }).int("'offset' debe ser un numero entero").gte(0, "'offset' deber ser mayor o igual a 0")),
  unread: z.enum(['true', 'false']).optional(),
});

export type PaginationUserNotification = z.infer<typeof paginationUserNotificationSchema>;
