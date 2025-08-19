import { z } from 'zod';

export const getPhotoPersonalSchema = z.object(
  {
    imgPath: z.string({ required_error: "'imgPath' es requerido", invalid_type_error: "'imgPath' debe ser un texto" }),
  },
  { required_error: 'Es necesario proporcionar un cuerpo en la solicitud HTTP ', invalid_type_error: 'El formato del cuerpo de la solicitud HTTP  no es válido.' },
);
