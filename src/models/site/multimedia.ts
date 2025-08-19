import { MySQL2 } from "../../database/mysql";
import { handleErrorWithArgument } from "../../utils/simpleErrorHandler";

import  type {RegistroArchivoCamara} from '../../types/db'
import { RowDataPacket } from "mysql2";

interface RegistroArchivoCamaraRowData extends RowDataPacket, RegistroArchivoCamara {}

export class Multimedia {
    static getArchivoCamByTypeAndCtrlIdAndCmrIdAndDateAndHour = handleErrorWithArgument<RegistroArchivoCamara[], {tipo:number,ctrl_id: number,cmr_id:number,date: string, hour: number}>(async ({ctrl_id, cmr_id,date ,hour, tipo})=>{
        
        const filePaths = await MySQL2.executeQuery<RegistroArchivoCamaraRowData[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroarchivocamara WHERE DATE(fecha) = ? AND HOUR(fecha) = ? AND tipo = ? AND cmr_id = ? `,values:[date, hour, tipo, cmr_id]})
    
        if(filePaths.length>0){
            return filePaths
        }
        return [];
    } , "Multimedia.getArchivoCamByTypeAndCtrlIdAndCmrIdAndDateAndHour")
}