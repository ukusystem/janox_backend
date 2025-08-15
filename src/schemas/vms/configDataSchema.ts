import z from 'zod';

const StreamSchema = z.object(
  {
    cmr_id: z.number({ required_error: "'cmr_id' es requerido", invalid_type_error: "'cmr_id' debe ser un numero" }).int("'cmr_id' debe ser un numero entero").gte(0, "'cmr_id' debe ser mayor o igual a 0"),
    // ip:z.string({required_error: "'ip' es requerido",invalid_type_error: "'ip' debe ser un string",}).ip({message:"'ip' invalido"}),
    // descripcion:z.string({required_error: "'descripcion' es requerido",invalid_type_error: "'descripcion' debe ser un string",}),
    // puertows: z.number({required_error: "'puertows' es requerido",invalid_type_error: "'puertows' debe ser un numero",}).int("'puertows' debe ser un numero entero").gte(0, "'puertows' debe ser mayor o igual a 0"),
    // tipo:z.string({required_error: "'tipo' es requerido",invalid_type_error: "'tipo' debe ser un string",}),
    // marca:z.string({required_error: "'marca' es requerido",invalid_type_error: "'marca' debe ser un string",}),
    // nodo:z.string({required_error: "'nodo' es requerido",invalid_type_error: "'nodo' debe ser un string",}),
    ctrl_id: z.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0"),
  },
  { required_error: 'Stream es requerido', invalid_type_error: 'El tipo Stream es incorrecto' },
);

export const ConfigData = z.object(
  {
    gridOption: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(8), z.literal('c3'), z.literal('c4')], {
      errorMap: () => {
        // const {path,code,message} = issue
        return { message: "El valor proporcionado para 'gridOption' no es válido. Los valores permitidos son 1, 2, 3, 4, 6, 8, 'c3' y 'c4'." };
      },
    }),
    streams: z.array(z.nullable(StreamSchema), { invalid_type_error: 'Tipo de Stream invalido', required_error: 'Stream es requerido' }),
  },
  { required_error: "'configdata' es requerido", invalid_type_error: "El tipo 'configdata' es invalido" },
);
