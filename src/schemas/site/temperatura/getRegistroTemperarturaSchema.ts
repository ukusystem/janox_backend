import { z } from "zod";

export const getRegistroTemperaturaSchema = z.object({
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    st_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'st_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'st_id' es requerido",invalid_type_error: "'st_id' debe ser un numero"}).int("'st_id' debe ser un numero entero").gte(0, "'st_id' debe ser mayor o igual a 0")),
    date: z.string({required_error:"'date' es requerido",invalid_type_error:"'date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/g,"'date' es incorrecto."), 
});
