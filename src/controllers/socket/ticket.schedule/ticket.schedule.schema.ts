import z from 'zod';

export const ticketScheduleNamespaceSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
