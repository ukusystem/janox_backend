export interface Notification {
  n_id: number;
  n_uuid: string;
  evento: string;
  titulo: string;
  mensaje: string;
  data: Record<string, unknown> | undefined;
  fecha: string;
}
