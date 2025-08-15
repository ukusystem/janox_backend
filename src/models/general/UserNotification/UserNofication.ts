export interface UserNofication {
  nu_id: string;
  u_id: number;
  n_uuid: string;
  fecha_creacion: string;
  fecha_entrega: string;
  fecha_lectura: string | null;
  leido: 0 | 1;
}
