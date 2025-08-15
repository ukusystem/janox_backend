import z from 'zod'

export const getTicketDetallesSchema = z.object({
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    rt_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'rt_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'rt_id' es requerido",invalid_type_error: "'rt_id' debe ser un numero"}).int("'rt_id' debe ser un numero entero").gte(0, "'rt_id' debe ser mayor o igual a 0")),
},{required_error: "Se requiere incluir los campos 'rt_id' y 'ctrl_id' en los query params de la consulta"})