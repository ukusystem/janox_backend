import z from 'zod';

export const smartmapCtrlParamSchema = z.object({
  ctrl_id: z.coerce
    .number({
      required_error: 'El controlador ID es requerido',
      invalid_type_error: 'El controlador ID debe ser un numero',
    })
    .int('El controlador ID debe ser un numero entero')
    .gt(0, 'El controlador ID debe ser mayor a 0'),
});
