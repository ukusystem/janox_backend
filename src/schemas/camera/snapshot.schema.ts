import z from 'zod'

export const cameraSnapshotSchema = z.object({
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    cmr_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'cmr_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'cmr_id' es requerido",invalid_type_error: "'cmr_id' debe ser un numero"}).int("'cmr_id' debe ser un numero entero").gte(0, "'cmr_id' debe ser mayor o igual a 0")),
})
 
