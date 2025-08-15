import { z } from "zod";

// export const getArchivoCamaraSchema = z.object({
//     xctrl_id: z.coerce.number({required_error: "El controlador ID es requerido",invalid_type_error: "El controlador ID debe ser un numero",}).int("El controlador ID debe ser un numero entero").gte(0, "El controlador ID debe ser mayor o igual a 0"),
//     xcmr_id: z.coerce.number({required_error: "El controlador ID es requerido",invalid_type_error: "El controlador ID debe ser un numero",}).int("El controlador ID debe ser un numero entero").gte(0, "El controlador ID debe ser mayor o igual a 0"),
//     xdate: z.coerce.date({required_error:"Fecha es requerido", invalid_type_error:"No es un tipo fecha"}),
//     xhour: z.coerce.number({required_error:"Hora es requerido",invalid_type_error:"Hora debe ser un numero"}).int("Hora debe ser un numero entero").gte(0,"Hora debe ser mayor o igual a 0").lte(23,"Hora debe ser menor o igual a 23"),
//     xtipo: z.coerce.number({required_error:"Tipo es requerido",invalid_type_error:"Tipo debe ser un numero"}).int("Tipo debe ser un numero entero").gte(0,"Tipo debe ser mayor o igual a 0").lte(1,"Tipo debe ser menor o igual a 1"),
// });

export const getArchivoCamaraSchema = z.object({
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    cmr_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'cmr_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'cmr_id' es requerido",invalid_type_error: "'cmr_id' debe ser un numero"}).int("'cmr_id' debe ser un numero entero").gte(0, "'cmr_id' debe ser mayor o igual a 0")),
    // date: z.coerce.date({required_error:"'date' es requerido", invalid_type_error:"'date' no es un tipo fecha"}),
    date:  z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'date' es requerido"}}}).pipe(z.coerce.string({required_error:"'date' es requerido", invalid_type_error:"'date' debe ser un string"}).regex(/^[0-9]{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])$/,"'date' proporcionado no es válido. Asegure de ingresar correctamente.")),
    hour: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'hour' es requerido"}}}).pipe(z.coerce.number({required_error: "'hour' es requerido",invalid_type_error: "'hour' debe ser un numero"}).int("'hour' debe ser un numero entero").gte(0, "'hour' debe ser mayor o igual a 0").lte(23,"'hour' debe ser menor o igual a 23")),
    tipo: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'tipo' es requerido"}}}).pipe(z.coerce.number({required_error: "'tipo' es requerido",invalid_type_error: "'tipo' debe ser un numero"}).int("'tipo' debe ser un numero entero")).pipe(z.union([z.literal(1),z.literal(0)],{errorMap: ()=>({message:"'tipo' proporcionado no es válido. Asegúrese de ingresar 0 o 1"})})),
    // tipo: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'tipo' es requerido"}}}).pipe(z.union([z.literal(1),z.literal(0)])),
    // limit: z.optional(z.coerce.number({required_error: "'limit' es requerido",invalid_type_error: "'limit' debe ser un numero",}).int("'limit' debe ser un numero entero").gte(0, "'limit' debe ser mayor o igual a 0").lte(100,"'limit' debe ser menor o igual a 100")),

    // offset:z.optional( z.coerce.number({required_error: "'offset' es requerido",invalid_type_error: "'offset' debe ser un numero",}).int("'offset' debe ser un numero entero").gte(0, "'offset' debe ser mayor o igual a 0")),
},{required_error:"Se requiere incluir el campo 'ctrl_id','cmr_id','date','hour' y 'tipo' en los query params de la consulta"})