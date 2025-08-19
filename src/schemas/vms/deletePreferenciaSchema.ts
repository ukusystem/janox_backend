import z from 'zod'
export const deletePreferenciaSchema = z.object({
    xprfvms_id: z.coerce.number({required_error:"'xprfvms_id' es requerido",invalid_type_error:"'xprfvms_id' debe ser un numero"}).int("'xprfvms_id' debe ser un numero entero").gte(0, "'xprfvms_id' deber ser mayor o igual a 0"),
})

