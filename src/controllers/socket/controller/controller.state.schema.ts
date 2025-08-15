import z from "zod";

export const controllerStateSocketSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
