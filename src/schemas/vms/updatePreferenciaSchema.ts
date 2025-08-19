import z from 'zod'
import { ConfigData } from './configDataSchema'

export const updatePreferenciaSchema = z.object({
    preferencia: z.string({required_error:"'preferencia' es requerido",invalid_type_error:"'preferencia' debe ser un string"}),
    configdata: ConfigData,
    prfvms_id: z.number({required_error: "'prfvms_id' es requerido",invalid_type_error: "'prfvms_id' debe ser un numero",}).int("'prfvms_id' debe ser un numero entero").gte(0, "'prfvms_id' debe ser mayor o igual a 0"),
})