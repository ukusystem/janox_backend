import z from 'zod';

export const recordStreamSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
  cmr_id: z.coerce.number().int().nonnegative(),
});
