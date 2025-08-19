import z from 'zod';

export const regEntSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
