import type { UserInfo } from "../models/auth";
import {Request} from 'express'
export interface RequestWithUser extends Request {
  user?: UserInfo;
}
