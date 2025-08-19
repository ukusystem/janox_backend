import z from "zod";

export const getEquipoSalidaSchema = z.object({
  xctrl_id: z.coerce
    .number({
      required_error: "El controlador ID es requerido",
      invalid_type_error: "El controlador ID debe ser un numero",
    }).int("El controlador ID debe ser un numero entero")
    .gte(0, "El controlador ID debe ser mayor o igual a 0"),
    xes_id: z.coerce
    .number({
      required_error: "El equipo salida ID es requerido",
      invalid_type_error: "El equipo salida ID debe ser un numero",
    }).int("El equipo salida ID debe ser un numero entero")
    .gte(0, "El equipo salida ID debe ser mayor o igual a 0"),
});