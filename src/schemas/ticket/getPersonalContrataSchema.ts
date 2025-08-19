import z from "zod";

export const getPersonalContrataSchema = z.object({
  xco_id: z.coerce
    .number({
      required_error: "La contrata ID es requerido",
      invalid_type_error: "La contrata  ID debe ser un numero",
    })
    .int("La contrata ID debe ser un numero entero")
    .gte(0, "La contrata ID debe ser mayor o igual a 0"),
});
