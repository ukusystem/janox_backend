import { z } from 'zod';

export const camStreamSocketSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
  cmr_id: z.coerce.number().int().nonnegative(),
  q: z.enum(['q1', 'q2', 'q3']),
});
