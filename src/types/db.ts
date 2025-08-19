export interface Notification {
  n_id: number;
  n_uuid: string;
  evento: string;
  titulo: string;
  mensaje: string;
  data: Record<string, unknown> | undefined;
  fecha: string;
}

export interface UserNofication {
  nu_id: number;
  u_id: number;
  n_uuid: string;
  fecha_creacion: string;
  fecha_entrega: string;
  fecha_lectura: string | null;
  leido: 0 | 1;
}

export interface Resolucion {
  res_id: number;
  nombre: string;
  relacionaspecto: string;
  ancho: number;
  altura: number;
  activo: 0 | 1;
}
export interface ConfigDataPreferencia {
  streams: ({ ctrl_id: number; cmr_id: number } | null)[];
  gridOption: 1 | 2 | 3 | 'c3' | 'c4';
}
export interface PreferenciasVms {
  prfvms_id: number;
  preferencia: string;
  u_id: number;
  configdata: ConfigDataPreferencia;
  activo: number;
}

export interface Rol {
  rl_id: number;
  rol: string;
  descripcion: string;
  activo: number;
}

export interface Usuario {
  u_id: number;
  usuario: string;
  contraseña: string;
  rl_id: number;
  fecha: string;
  p_id: number;
  activo: number;
}

export interface Cargo {
  c_id: number;
  cargo: string;
}

export interface RegistroRed {
  rr_id: number;
  co_id: number;
  estado: number;
  fecha: string;
}

export interface Rubro {
  r_id: number;
  rubro: string;
}

export interface EquipoAcceso {
  ea_id: number;
  nombre: string;
}

export interface TipoCamara {
  tc_id: number;
  tipo: string;
}

export interface Marca {
  m_id: number;
  marca: string;
}

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

export interface TipoTrabajo {
  tt_id: number;
  nombre: string;
}

export interface Contrata {
  co_id: number;
  contrata: string;
  r_id: number;
  descripcion: string;
  activo: number;
}

export interface Acceso {
  a_id: number;
  serie: string;
  ea_id: number;
  administrador: number;
  p_id: number;
  activo: number;
}

export interface Estado {
  estd_id: number;
  estado: string;
}

export interface Controlador {
  ctrl_id: number;
  nodo: string;
  rgn_id: number;
  direccion: string;
  descripcion: string;
  latitud: string;
  longitud: string;
  usuario: string;
  contraseña: string;
  serie: string;
  ip: string;
  mascara: string;
  puertaenlace: string;
  puerto: number;
  personalgestion: string;
  personalimplementador: string;
  seguridad: 0 | 1;
  conectado: 0 | 1;
  modo: 0 | 1;
  activo: 0 | 1;
  motionrecordseconds: number;
  res_id_motionrecord: number;
  motionrecordfps: number;
  motionsnapshotseconds: number;
  res_id_motionsnapshot: number;
  motionsnapshotinterval: number;
  res_id_streamprimary: number;
  streamprimaryfps: number;
  res_id_streamsecondary: number;
  streamsecondaryfps: number;
  res_id_streamauxiliary: number;
  streamauxiliaryfps: number;
  celular: number;
}

export interface EquipoEntrada {
  ee_id: number;
  detector: string;
  descripcion: string;
  activo: number;
}

export interface Region {
  rgn_id: number;
  region: string;
  descripcion: string;
  activo: number;
}

export interface EquipoSalida {
  es_id: number;
  actuador: string;
  descripcion: string;
  activo: number;
}

export interface Spi {
  spi_id: number;
  equipo: string;
}

//////////////////// NODO

export interface Camara {
  cmr_id: number;
  serie: string;
  tc_id: number;
  m_id: number;
  usuario: string;
  contraseña: string;
  ip: string;
  puerto: number;
  descripcion: string;
  puertows: number;
  mascara: string;
  puertaenlace: string;
  conectado: number;
  activo: 0 | 1;
}

export interface RegistroTicket {
  rt_id: number;
  p_id: number;
  telefono: string;
  correo: string;
  tt_id: number;
  prioridad: number;
  descripcion: string;
  fechacomienzo: string;
  fechatermino: string;
  estd_id: number;
  fechaestadofinal: string;
  fechacreacion: string;
  sn_id: number;
  enviado: number;
  co_id: number;
}

export interface RegistroAcceso {
  ra_id: number;
  serie: number;
  ea_id: number;
  p_id: number; // co_id: number;
  administrador: number;
  autorizacion: number;
  fecha: string;
  tipo: number;
  sn_id: number;
}

//aqui
export interface RegistroPeticion {
  rp_id: number;
  pin: number;
  estd_id: number;
  orden: number;
  fecha: string;
}

export interface RegistroMicroSd {
  rmsd_id: number;
  estd_id: number;
  fecha: string;
}

export interface RegistroEntrada {
  rentd_id: number;
  pin: number;
  estado: number;
  ee_id: number;
  fecha: string;
}

export interface PinesEntrada {
  pe_id: number;
  pin: number;
  ee_id: number;
  descripcion: string;
  estado: number;
  activo: number;
}

export interface PinesSalida {
  ps_id: number;
  pin: number;
  es_id: number;
  descripcion: string;
  estado: number;
  activo: number;
}

export interface RegistroSalida {
  rs_id: number;
  pin: number;
  estado: number;
  es_id: number;
  fecha: string;
}

export interface RegistroSpi {
  rspi_id: number;
  spi_id: number;
  datos: string;
  fecha: string;
}

//////

export interface RegistroArchivoCamara {
  rac_id: number;
  cmr_id: number;
  tipo: number;
  ruta: string;
  thumbnail: string | null;
  fecha: string;
}

export interface RegistroEstadoCamara {
  rec_id: number;
  cmr_id: number;
  fecha: string;
  conectado: number;
}

export interface ArchivoTicket {
  at_id: number;
  ruta: string;
  nombreoriginal: string;
  tipo: string;
  rt_id: number;
  tamaño: number;
  thumbnail: string | null;
}

export interface ActividadPersonal {
  ap_id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  cargo: string;
  contrata: string;
  rt_id: number;
  foto: string | null;
}

export interface MedidorEnergia {
  me_id: number;
  serie: number | string;
  descripcion: string;
  voltaje: number;
  amperaje: number;
  fdp: number;
  frecuencia: number;
  potenciaw: number;
  potenciakwh: number;
  activo: number;
}

export interface RegistroEnergia {
  re_id: number;
  me_id: number;
  voltaje: number;
  amperaje: number;
  fdp: number;
  frecuencia: number;
  potenciaw: number;
  potenciakwh: number;
  fecha: string;
}

export interface SubNodo {
  sn_id: number;
  nombre: string;
}

export interface RegistroTemperatura {
  rtmp_id: number;
  st_id: number;
  valor: number;
  fecha: string;
}

export interface SensorTemperatura {
  st_id: number;
  serie: string;
  ubicacion: string;
  actual: number;
  activo: number;
  umbral_alarma: number;
}

export interface RegistroSeguridad {
  rsg_id: number;
  estado: number;
  fecha: string;
}
