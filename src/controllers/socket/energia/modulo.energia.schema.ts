import z from "zod";

export const medEnerNamespaceSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
