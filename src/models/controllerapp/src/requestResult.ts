export class RequestResult {
  readonly resultado: boolean;
  readonly mensaje: string;
  readonly codigo: number;
  readonly id: number = 0;

  constructor(resultado: boolean, mensage: string, code: number = -1, id: number = 0) {
    this.resultado = resultado;
    this.mensaje = mensage;
    this.codigo = code;
    this.id = id;
  }
}
