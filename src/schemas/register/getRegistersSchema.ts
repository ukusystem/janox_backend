import { z } from "zod";
export const getRegistersSchema = z.object({
    type: z.enum(["acceso" ,"energia" ,"entrada" ,"estadocamara" ,"microsd" ,"peticion" ,"salida" ,"seguridad" ,"temperatura" ,"ticket"],{errorMap: (_,ctx)=>{ return {message: ctx.defaultError}}}),
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    start_date: z.string({required_error:"'start_date' es requerido",invalid_type_error:"'start_date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/g,"'start_date' es incorrecto."), 
    end_date: z.string({required_error:"'end_date' es requerido",invalid_type_error:"'end_date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/g,"'end_date' es incorrecto."), 
    limit: z.optional(z.coerce.number({required_error: "'limit' es requerido",invalid_type_error: "'limit' debe ser un numero",}).int("'limit' debe ser un numero entero").gte(1, "'limit' debe ser mayor o igual a 1").lte(100,"'limit' debe ser menor o igual a 100")),
    cursor: z.optional(z.coerce.number({required_error: "'cursor' es requerido",invalid_type_error: "'cursor' debe ser un numero",}).int("'cursor' debe ser un numero entero")),
    p_action: z.enum(["next" ,"prev","lim","init"],{errorMap: (_,ctx)=>{ return {message: "p_action : " + ctx.defaultError}}})
  },{required_error: "Se requiere incluir los campos 'rt_id' y 'ctrl_id' en los query params de la consulta"})