import z from "zod";

export const lastSnapshotNamespaceSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
