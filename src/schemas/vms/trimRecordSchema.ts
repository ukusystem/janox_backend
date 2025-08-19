import z from 'zod'
export const trimRecordSchema = z.object({
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    cmr_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'cmr_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'cmr_id' es requerido",invalid_type_error: "'cmr_id' debe ser un numero"}).int("'cmr_id' debe ser un numero entero").gte(0, "'cmr_id' debe ser mayor o igual a 0")),
    // date: z.string({required_error:"'date' es requerido",invalid_type_error:"'date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/g,"'date' es incorrecto."), 
    date: z.string({required_error:"'date' es requerido",invalid_type_error:"'date' debe ser un string"}).date("'date' es incorrecto."), 
    startTime: z.string({required_error:"'startTime' es requerido",invalid_type_error:"'startTime' debe ser un string"}).time("'startTime' es incorrecto."), 
    endTime: z.string({required_error:"'endTime' es requerido",invalid_type_error:"'endTime' debe ser un string"}).time("'endTime' es incorrecto."), 

})

