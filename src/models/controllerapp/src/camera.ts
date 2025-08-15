import {Mortal} from './mortal'

/**
 * @deprecated
 */
export class Camera extends Mortal {
  // #inetAddress = null;

  readonly cameraIP;
  readonly cameraID;
  readonly nodeID;
  errorNotified = false;

  constructor(id: number, parentNodeID: number, ip: string = "0.0.0.0") {
    super();
    this.cameraIP = ip;
    this.cameraID = id;
    this.nodeID = parentNodeID;
  }

  getAddress(): string {
    return this.cameraIP;
  }

  toString(): string {
    return `ID=${this.cameraID} IP=${this.cameraIP} Node ID=${this.nodeID}`;
  }
}
