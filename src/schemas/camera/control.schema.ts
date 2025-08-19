import z from 'zod';

export const cameraControlSchema = z.object({
  ctrl_id: z
    .union([z.string(), z.number()], {
      errorMap: () => {
        return { message: "'ctrl_id' es requerido" };
      },
    })
    .pipe(z.coerce.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
  cmr_id: z
    .union([z.string(), z.number()], {
      errorMap: () => {
        return { message: "'cmr_id' es requerido" };
      },
    })
    .pipe(z.coerce.number({ required_error: "'cmr_id' es requerido", invalid_type_error: "'cmr_id' debe ser un numero" }).int("'cmr_id' debe ser un numero entero").gte(0, "'cmr_id' debe ser mayor o igual a 0")),
  action: z.enum(['start', 'stop'], {
    errorMap: (_, ctx) => {
      return { message: 'action : ' + ctx.defaultError };
    },
  }),
  movement: z.enum(['Right', 'Left', 'Up', 'Down', 'RightUp', 'RightDown', 'LeftUp', 'LeftDown', 'ZoomTele', 'ZoomWide', 'FocusFar', 'FocusNear', 'IrisSmall', 'IrisLarge'], {
    errorMap: (_, ctx) => {
      return { message: 'movement : ' + ctx.defaultError };
    },
  }),
  velocity: z
    .union([z.string(), z.number()], {
      errorMap: () => {
        return { message: "'velocity' es requerido" };
      },
    })
    .pipe(z.coerce.number({ required_error: "'velocity' es requerido", invalid_type_error: "'velocity' debe ser un numero" }).gte(0, "'velocity' debe ser mayor o igual a 0").lte(1, "'velocity' deber ser menor o igual a 1")),
});
