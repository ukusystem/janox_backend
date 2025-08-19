export class CameraForFront {
  readonly ip: string|null;
  readonly cmr_id: number;
  readonly ctrl_id: number;
  readonly usuario: string|null;
  contraseña: string | null;

  constructor(cmr_id: number, ctrl_id: number, ip: string|null = null, usuario: string|null = null, contraseña: string | null = null) {
    this.cmr_id = cmr_id;
    this.ip = ip;
    this.ctrl_id = ctrl_id;
    this.usuario = usuario;
    this.contraseña = contraseña;
  }
}
