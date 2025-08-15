import { GeneralConfig, GeneralUpdateFunction } from "./system.state.types";

export class GeneralUpdate {

  static #functions: { [P in keyof GeneralConfig]: GeneralUpdateFunction<P> } = {
      COMPANY_NAME: (currentConfig, newValue) => {
        if (currentConfig.COMPANY_NAME !== newValue) {
          currentConfig.COMPANY_NAME = newValue;
        }
      },
      EMAIL_ADMIN: (currentConfig, newValue) => {
        if (currentConfig.EMAIL_ADMIN !== newValue) {
          currentConfig.EMAIL_ADMIN = newValue;
        }
      },
    };

  static getFunction<T extends keyof GeneralConfig>(keyConfig: T): (currentConfig: GeneralConfig, newValue: GeneralConfig[T]) => void {
    return GeneralUpdate.#functions[keyConfig];
  }
}
