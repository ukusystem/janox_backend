import z from 'zod'
import { ConfigData } from './configDataSchema'

export const createPreferenciaSchema = z.object({
    preferencia: z.string({required_error:"'preferencia' es requerido",invalid_type_error:"'preferencia' debe ser un string"}),
    configdata: ConfigData
},{required_error:"Es necesario proporcionar un cuerpo en la solicitud HTTP", invalid_type_error: "El formato del cuerpo de la solicitud HTTP  no es válido."})