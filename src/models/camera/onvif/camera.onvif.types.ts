// @ts-nocheck
import { Cam } from 'onvif'; // No existen types para ts

export type CamMovement = 'Right' | 'Left' | 'Up' | 'Down' | 'RightUp' | 'RightDown' | 'LeftUp' | 'LeftDown' | 'ZoomTele' | 'ZoomWide';
export type CamImaging = 'FocusFar' | 'FocusNear' | 'IrisSmall' | 'IrisLarge';
export type ControlPTZDTO = { action: 'start' | 'stop'; velocity: number; movement: CamMovement };
export type ControlImagingDTO = { action: 'start' | 'stop'; velocity: number; movement: CamImaging };
export type PTZAction = 'start' | 'stop';

export interface CamOnvifProps {
  ctrl_id: number;
  cmr_id: number;
  ip: string;
  usuario: string;
  contraseña: string;
}

export interface CamOnvifMethods {
  controlPTZ(movement: CamMovement, velocity: number, action: PTZAction): Promise<void>;
  presetPTZ(n_preset: number): Promise<void>;
}
export type OnvifInstance = Cam;

export type CamOnvifMap = Map<number, OnvifInstance>; // key : cmr_id

export type CtrlOnvifMap = Map<number, CamOnvifMap>; // key : ctrl_id

export interface MovePTZ_DTO {
  x_speed: number;
  y_speed: number;
  zoom_speed: number;
}
