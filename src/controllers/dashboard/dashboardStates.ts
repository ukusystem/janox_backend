import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Dashboard } from "../../models/dashboard/dashboard";

export const dashboardStates = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const {ctrl_id} = req.query as {ctrl_id:string}
    const data = await Dashboard.getStates({ctrl_id:Number(ctrl_id)})
    res.json(data)
  }
);