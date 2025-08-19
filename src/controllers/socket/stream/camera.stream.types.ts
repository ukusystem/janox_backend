import { ChildProcessByStdio } from 'child_process';

export enum CamStreamQuality {
  Primary = 'q1',
  Secondary = 'q2',
  Auxiliary = 'q3',
}

export interface CamStreamState {
  isConfiguring: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface ICamStreamFfmpegProcess {
  [ctrl_id: number]: {
    [cmr_id: number]: {
      [q: string]: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ffmpegProcess: ChildProcessByStdio<null, any, null>;
        isChunkInFrame: boolean;
        bufferFrame: Buffer;
      };
    };
  };
}

export interface CamStreamObserver {
  updateState(state: boolean, typeState: keyof CamStreamState): void;
  updateFlux(frameBase64: string): void;
  updateError(message: string): void;
}

export interface ICamStreamProccesObserver {
  [ctrl_id: number]: {
    [cmr_id: number]: {
      [q: string]: {
        observer: CamStreamObserver;
        canDelete: boolean;
      };
    };
  };
}

export type CamStreamDirection = { ctrl_id: number; cmr_id: number; q: CamStreamQuality };

export interface CamStreamSubject {
  registerObserver(direction: CamStreamDirection, observer: CamStreamObserver): void;
  unregisterObserver(direction: CamStreamDirection): void;
  notifyState(direction: CamStreamDirection, state: boolean, typeState: keyof CamStreamState): void;
  notifyFlux(direction: CamStreamDirection, frameBase64: string): void;
  notifyError(direction: CamStreamDirection, message: string): void;
}
