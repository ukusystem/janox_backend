import { Rol } from "./rol";

export interface Usuario {
id:number;
usuario: string;
contraseña: string;
nombre: string;
dni: number;
roles_id:number;
telefono : number;
correo : string;
fecha : Date;
rol: Rol;
descripcion: string;
contrata_id: number;
contrata: string;
rubros_id: number;
}
