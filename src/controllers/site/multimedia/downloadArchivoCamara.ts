import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import path from "path";
import { CustomError } from "../../../utils/CustomError";


export const downloadArchivoCamara = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction ) => {
    const {filePath} = req.query as {filePath: string} // filePatb -> encodeURIComponent
    const filePathFinal = path.resolve("./", decodeURIComponent(filePath));
    res.sendFile(filePathFinal, (err) => {
      if (err) {
        const errFileNotFound = new CustomError(
          `El archivo solicitado no está disponible en el servidor.`,
          404,
          "Not Found"
        );
        next(errFileNotFound);
      }
    });
})
