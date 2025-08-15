import z from "zod";

export const pinSalNamespaceSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
