import z from 'zod';

export const senTempNamespaceSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
