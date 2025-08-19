export enum OperationType {
  Create = 'INSERCION',
  Update = 'ACTUALIZACION',
  Delete = 'ELIMINACION',
}

export interface RecordActivity {
  id_actividad: number;
  nombre_tabla: string;
  id_registro: number;
  tipo_operacion: OperationType;
  valores_anteriores: Record<any, any> | null;
  valores_nuevos: Record<any, any> | null;
  realizado_por: string;
  fecha: string;
}

export type InsertRecordActivity = Omit<RecordActivity, 'id_actividad' | 'fecha'>;
