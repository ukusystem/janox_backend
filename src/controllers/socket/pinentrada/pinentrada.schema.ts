import z from 'zod';

export const pinEntSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
