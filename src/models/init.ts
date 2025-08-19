import { MySQL2 } from "../database/mysql";
import { handleErrorWithoutArgument } from "../utils/simpleErrorHandler";
import type { Camara, Controlador, Region} from "../types/db.js";
import { RowDataPacket } from "mysql2";

type RegionNodos = Pick<Region,"region"> & Pick<Controlador,"ctrl_id"|"nodo" |"rgn_id"> & {nododb_name:string}

export type ControladorInfo = Pick<Controlador, "ctrl_id"|"nodo"|"rgn_id"|"direccion"|"descripcion"|"latitud"|"longitud"|"serie"|"personalgestion"|"personalimplementador" | "modo" | "seguridad" | "conectado"> & Pick<Region,"region">
interface ControladorInfoRowData extends RowDataPacket , ControladorInfo {}

interface RegionNodosData extends RowDataPacket, RegionNodos {}
interface CameraRowData extends RowDataPacket , Camara {}

export class Init {

  static getRegionNodos= handleErrorWithoutArgument<RegionNodos[]>(
    async ()=>{

      const region_nodos = await MySQL2.executeQuery<RegionNodosData[]>({sql:`SELECT r.region, c.nodo, c.ctrl_id , c.rgn_id , concat('nodo', c.ctrl_id) as nododb_name FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo=1`})
      
      if(region_nodos.length>0){
        return region_nodos
      }
      return []
    }
  ,"Init.getRegionNodos")

  static getControladores = handleErrorWithoutArgument<ControladorInfo[]>(async ()=>{
    // posiblemente agregar condicion: conectado controlador
    const controladores = await MySQL2.executeQuery<ControladorInfoRowData[]>({sql:`SELECT c.ctrl_id, c.modo , c.seguridad, c.nodo, c.conectado, c.rgn_id, r.region , c.direccion, c.descripcion, c.latitud, c.longitud , c.serie , c.personalgestion , c.personalimplementador FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.activo = 1 ORDER BY c.ctrl_id ASC`})
    if(controladores.length>0){
      return controladores
    }
    return []
  }, "Init.getControladores")

  static getAllCameras = handleErrorWithoutArgument< Record<number,AllCam[]> >(async ()=>{
    const region_nodos = await Init.getRegionNodos()
    if( region_nodos.length > 0){
      const camerasData = await region_nodos.reduce<Promise<Record<number,AllCam[]>>>(async (resultPromise, item) => {
        const result = await resultPromise;
        const { nododb_name,ctrl_id } = item;

        const cams = await MySQL2.executeQuery<CameraRowData[]>({sql:`SELECT * FROM ${nododb_name}.camara c WHERE c.activo = 1`})

        let camsMap : AllCam[]  = []
        if (cams.length > 0) {
          camsMap = cams.map((cam) => {
            return { ...cam, ctrl_id };
          });
        }

        result[ctrl_id] = camsMap
        return result
      },Promise.resolve({}))
      return camerasData
    }
    return {}
  }, "Init.getAllCameras");
}

type AllCam = Camara & {ctrl_id:number}