
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { CustomError } from "../../../utils/CustomError";
import path from "path";

export const downloadFotoActividadPersonal = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const data = req.query as {filePath:string} 

    const filePath = path.resolve("./",decodeURIComponent(data.filePath));

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