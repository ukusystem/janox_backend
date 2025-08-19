import { NextFunction,Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { ConfigDataFinal, Stream, Vms } from "../../models/vms";
import type { RequestWithUser } from "../../types/requests";
import { NodoCameraMapManager } from "../../models/maps/nodo.camera";
import { PreferenciasVms } from "../../types/db";

export const getPreferencias = asyncErrorHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user!; // ! -> anteponer middleware auth
    const preferencias = await Vms.getPreferencias({ u_id: user.u_id });

    const responseFinal = preferencias.map<PreferenciasVms>((preferencia)=>{
      const finalStreams = preferencia.configdata.streams.map((stream)=>{
        if(stream !== null){
          const {cmr_id,ctrl_id} = stream;
          const camData = NodoCameraMapManager.getCamera(ctrl_id,cmr_id);
          if(camData !== undefined){
            const streamData : Stream = {
              cmr_id,
              ctrl_id,
              descripcion: camData.descripcion,
              tc_id: camData.tc_id
            }
            return streamData
          }
          return null
        }
        return null;
      })
      const newConfData : ConfigDataFinal = {
        gridOption: preferencia.configdata.gridOption,
        streams: finalStreams
      }
      return {
        ...preferencia,
        configdata: newConfData
      }
    });

    res.json(responseFinal)
  }
);
