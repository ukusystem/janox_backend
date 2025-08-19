import z from 'zod'
export const downloadArchivoRespaldoSchema = z.object({
    filePath: z.string({required_error: "'filePath' es requerido",invalid_type_error: "'filePath' debe ser un string"})
},{required_error: "Se requiere incluir el campo 'filePath' en los query params de la consulta"})