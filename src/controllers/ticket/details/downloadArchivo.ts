import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import path from "path";
import { CustomError } from "../../../utils/CustomError";

export const downloadArchivo = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const data : {path:string} = req.body
    const filePath = path.resolve("./archivos/ticket/",data.path);

    res.sendFile(filePath,(err)=>{
      if(err){
        const errFileNotFound = new CustomError(
          `El archivo solicitado no está disponible en el servidor.`,
          404,
          "Not Found"
        );
        next(errFileNotFound)
      }
    })
  }
);