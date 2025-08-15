export class ParseType {
  static TYPE_INT = 0;
  static TYPE_BIG = 1;
  static TYPE_FLOAT = 2;
  static TYPE_STR = 3;
  static TYPE_LONG = 4;
}

export class Changes {
  static NONE = 0;
  static TO_ACTIVE = 1;
  static TO_INACTIVE = 2;
}

export class Result {
  static NONE = 0;
  static UPDATE_NODES = 1;
  static OK = 2;
  static TIMEOUT = 3;
  static DISCONNECTED = 4;
  static ERROR = 5;
  static NULL_FIELD = 6;
  static CAMERA_ADD = 7;
  static CAMERA_UPDATE = 8;
  static CAMERA_DISABLE = 9;
}

export const States = {
  IMPOSSIBLE: -1,
  WAITING_APPROVE: 1,
  ACCEPTED: 2,
  CANCELLED: 3,
  REJECTED: 4,
  COMPLETED: 5,
  ERROR: 6,
  MOUNTED: 7,
  UNMOUNTED: 8,
  EJECTED: 9,
  TIMEOUT: 10,
  EXECUTED: 11,
  DISCONNECTED: 12,
  WRONG_FORMAT: 13,
  NONEXISTENT: 14,
  ILLEGAL: 15,
  FINISHED: 16,
  // Nullified was discarted as a ticket state
  // NULLIFIED: 17,
  IGNORED: 18,
  MOUNTING: 19,
  EJECTING: 20,
  ATTENDED: 21,
  ABSENCE: 22,
};

export function getState(id: number): number {
  for (const [, v] of Object.entries(States)) {
    if (v === id) {
      return v;
    }
  }
  return States.IMPOSSIBLE;
}
