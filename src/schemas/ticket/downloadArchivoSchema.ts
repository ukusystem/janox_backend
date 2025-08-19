import { z } from "zod";

export const downloadArchivoSchema = z.object({
  path: z.string({required_error:"'path' es requerido",invalid_type_error:"'path' debe ser un string"}),
},{required_error:"Es necesario proporcionar un cuerpo en la solicitud HTTP " , invalid_type_error: "El formato del cuerpo de la solicitud HTTP  no es válido."});