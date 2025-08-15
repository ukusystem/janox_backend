import { getControlOnvif } from "./getControlOnvif";
import { getPresetOnvif } from "./getPresetOnvif";
import {getAllCameras} from './getAllCameras'
import {getSnapshot} from './getSnapshot'
import {getCameraByCtrlId} from './getCameraByCtrlId'
export const cameraController = {
  getControlOnvif,
  getPresetOnvif,
  getAllCameras,
  getSnapshot,
  getCameraByCtrlId
};
