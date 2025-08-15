import { NextFunction, Response, Request } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import path from "node:path";
import { CustomError } from "../../utils/CustomError";

export const getSegmentNvr = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ctrl_id, cmr_id, date, segment_name } = req.params;

    const segmentFilePath = path.resolve(`./nvr/hls/nodo${ctrl_id}/camara${cmr_id}/${date}/record/${segment_name}`).split(path.sep).join(path.posix.sep);

    res.sendFile(segmentFilePath, (err) => {
      if (err) {
        const errFileNotFound = new CustomError(
          `Segmento no disponible.`,
          404,
          "Not Found"
        );
        next(errFileNotFound);
      }
    });
  }
);
