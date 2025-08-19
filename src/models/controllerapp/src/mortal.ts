import * as Useful from './useful'

/**
 * Represent an object that can be 'alive', meaning that some task will make
 * tests on this object periodically to set and check its state, for example checking
 * activity on a socket connection, or polling the ip address of some device
 * like a camera.
 */
export class Mortal {
  static readonly DEFAULT_INITIAL_STATE = false;

  private lastTimeAlive = 0;
  // private previousState = Mortal.DEFAULT_INITIAL_STATE;
  // private currentState = Mortal.DEFAULT_INITIAL_STATE;

  /**
   * Save the current time as the last time that this object was 'alive'.
   */
  setAlive() {
    this.lastTimeAlive = Useful.timeInt();
  }

  /**
     * Get if this object wasn't set as alive for a period of time, similar to a timeout.
     * This does not update the current state of this object.
     * @param maxDelay Maximum seconds without an update as alive that can pass to still consider this object as alive.
     * @return True if this object hasn't been set as active for `maxDelay` time.
     */
  hasBeenInactiveFor(maxDelay: number): boolean {
    return Useful.timeInt() >= this.lastTimeAlive + maxDelay;
  }

  /**
   * 
   * @returns The time that the object has been inactive in seconds.
   */
  // getTimeInactive(){
  //   return Useful.timeInt() - this.lastTimeAlive
  // }

  /**
   * Set the current state of the object. If the new state is active, also save the current time as the last time it was active.
   * @param state True to set the state as active, false for inactive.
   */
  // setState(state: boolean) {
  //   // this.previousState = this.currentState;
  //   this.currentState = state;
  // }

  /**
   * Get the change in the state of this object. The states are updated by calling {@linkcode setState} or its overload.
   * @return The change in the state. After calling {@linkcode setState}, this method may return a different value.
   */
  // getChange(): number {
  //   if (!this.previousState && this.currentState) {
  //     return Changes.TO_ACTIVE;
  //   } else if (this.previousState && !this.currentState) {
  //     return Changes.TO_INACTIVE;
  //   }
  //   return Changes.NONE;
  // }
}
