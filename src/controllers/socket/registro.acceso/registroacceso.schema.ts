import z from 'zod';

export const regAccSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
