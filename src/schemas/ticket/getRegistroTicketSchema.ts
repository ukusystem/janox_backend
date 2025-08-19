import z from "zod";

export const getRegistroTicketSchema = z.object({
  xctrl_id: z.coerce
    .number({
      required_error: "El controlador ID es requerido",
      invalid_type_error: "El controlador ID debe ser un numero",
    }).int("El controlador ID debe ser un numero entero")
    .gte(0, "El controlador ID debe ser mayor o igual a 0"),
});
