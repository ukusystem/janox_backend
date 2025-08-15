import { z } from 'zod';

const PersonalSchema = z.object(
  {
    nombre: z.string({ required_error: "Personal: 'nombre' es requerido", invalid_type_error: "'nombre' debe ser un string" }).max(30, "Máximo 30 caracteres permitidos para el 'nombre'."),
    apellido: z.string({ required_error: "Personal: 'apellido' es requerido", invalid_type_error: "'apellido' debe ser un string" }).max(30, "Máximo 30 caracteres permitidos para el 'apellido'."),
    // telefono: z.number({required_error:"Personal: 'telefono' es requerido",invalid_type_error:"'telefono' debe ser un numero"}).int("'telefono' debe ser un numero entero"),
    telefono: z.string({ required_error: "Personal: 'telefono' es requerido", invalid_type_error: "'telefono' debe ser un string" }).regex(/^\d{9,20}$/, "Número de 'telefono' incorrecto. Debe tener de 9 a 20 caracteres."),
    // dni: z.number({required_error:"Personal: 'dni' es requerido",invalid_type_error:"'dni' debe ser un numero"}).int("'dni' debe ser un numero entero"),
    dni: z.string({ required_error: "Personal: 'dni' es requerido", invalid_type_error: "'dni' debe ser un numero" }).regex(/^\d{8,12}$/, "Número de 'dni' incorrecto. Debe tener de 8 a 12 caracteres."),
    c_id: z.number({ required_error: "Personal: 'c_id' es requerido", invalid_type_error: "'c_id' debe ser un numero" }).int("'c_id' debe ser un numero entero").gte(0, "'c_id' deber ser mayor o igual a 0"),
    co_id: z.number({ required_error: "Personal: 'co_id'Contrata ID  es requerido", invalid_type_error: 'Contrata  ID debe ser un numero' }).int("'co_id' debe ser un numero entero").gte(0, 'La contrata ID deber ser mayor o igual a 0'),
    foto: z.string({ required_error: "Personal: 'foto' es requerido", invalid_type_error: "'foto' debe ser un string" }).nullable(),
    isNew: z.boolean({ required_error: "Personal: 'isNew' es requerido", invalid_type_error: "'isNew' debe ser un boolean" }),
  },
  { required_error: 'Personal item es requirido', invalid_type_error: 'El tipo personal item es incorrecto' },
);

const SolicitanteSchema = z.object(
  {
    // telefono: z.number({required_error:"Solicitante: 'telefono' es requerido",invalid_type_error:"'telefono' debe ser un numero"}).int("'telefono' debe ser un numero entero"),
    telefono: z.string({ required_error: "Solicitante: 'telefono' es requerido", invalid_type_error: "'telefono' debe ser un string" }).regex(/^\d{9,20}$/, "Número de 'telefono' incorrecto. Debe tener de 9 a 20 caracteres."),
    correo: z
      .string({ required_error: "Solicitante: 'correo' es requerido", invalid_type_error: "'correo' debe ser un string" })
      .regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, "El 'correo' ingresado es incorrecto.")
      .max(100, "Máximo 100 caracteres permitidos para el 'correo'."),
    descripcion: z.string({ required_error: "Solicitante: 'descripcion' es requerido", invalid_type_error: "'descripcion' debe ser un string" }).max(100, "Máximo 100 caracteres permitidos para la 'descripcion'."),
    fechacomienzo: z.number({ required_error: "Solicitante: 'fechacomienzo' es requerido", invalid_type_error: " 'fechacomienzo'debe ser un numero" }).int("'fechacomienzo' debe ser un numero entero"),
    fechatermino: z.number({ required_error: "Solicitante: 'fechatermino' es requerido", invalid_type_error: "'fechatermino' debe ser un numero" }).int("'fechatermino' debe ser un numero entero"),
    prioridad: z.number({ required_error: "Solicitante: 'prioridad' es requerido", invalid_type_error: "'prioridad' debe ser un numero" }).int("'prioridad' debe ser un numero entero").gte(1, "'prioridad' debe ser mayor o igual a 1").lte(3, "'prioridad' debe ser menor o igual a 3"),
    p_id: z.number({ required_error: "Solicitante: 'p_id' es requerido", invalid_type_error: "'p_id' debe ser un numero" }).int("'p_id' debe ser un numero entero").gte(0, "'p_id' deber ser mayor o igual a 0"),
    tt_id: z.number({ required_error: "Solicitante: 'tt_id' es requerido", invalid_type_error: "'tt_id' debe ser un numero" }).int("'tt_id' debe ser un numero entero").gte(0, "'tt_id' deber ser mayor o igual a 0"),
    sn_id: z.number({ required_error: "Solicitante: 'sn_id' es requerido", invalid_type_error: "'sn_id' debe ser un numero" }).int("'sn_id' debe ser un numero entero").gte(0, "'sn_id' deber ser mayor o igual a 0"),
    co_id: z.number({ required_error: "Solicitante: 'co_id' es requerido", invalid_type_error: "'co_id' debe ser un numero" }).int("'co_id' debe ser un numero entero").gte(0, "'co_id' deber ser mayor o igual a 0"),
    ctrl_id: z.number({ required_error: "Solicitante: 'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' deber ser mayor o igual a 0"),
  },
  { required_error: 'Solicitante es requerido', invalid_type_error: 'El tipo Solicitante no es correcto' },
);

export const createTicketSchema = z.object(
  {
    solicitante: SolicitanteSchema,
    personales: z.array(PersonalSchema, { required_error: 'Personales es requerido', invalid_type_error: 'El tipo Personales es incorrecto' }),
    // personales: z.array(PersonalSchema,{required_error:"Personales es reqerido"}),
  },
  { required_error: 'Formvalue es requerido', invalid_type_error: 'El tipo formvalue debe ser un objeto.' },
);
