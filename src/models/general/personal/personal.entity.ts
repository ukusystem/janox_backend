export interface Personal {
  p_id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  c_id: number;
  co_id: number;
  foto: string;
  correo: string;
  activo: number;
}

export interface SinglePersonal extends Personal {
  cargo_nombre: string;
  cantidad_cuentas: number;
  cantidad_tarjetas: number;
  u_id: number;
  usuario: string;
}

export interface PersonalWithOcupation extends Personal {
  cargo: string;
}
