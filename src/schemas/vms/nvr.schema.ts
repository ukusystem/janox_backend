import z from 'zod'
export const nvrSchema = z.object({
    date: z.string({required_error:"'date' es requerido",invalid_type_error:"'date' debe ser un string"}).date("'date' es incorrecto."), 
    ctrl_id: z.coerce.number({required_error:"'ctrl_id' es requerido",invalid_type_error:"'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' deber ser mayor o igual a 0"),
    cmr_id: z.coerce.number({required_error:"'cmr_id' es requerido",invalid_type_error:"'cmr_id' debe ser un numero"}).int("'cmr_id' debe ser un numero entero").gte(0, "'cmr_id' deber ser mayor o igual a 0"),
})