import { MySQL2 } from "../../database/mysql";
import { genericLogger } from "../../services/loggers";
import { GeneralUpdate } from "./system.general.update";
import { ControllerConfig, GeneralConfig, GeneralConfigRowData } from "./system.state.types";

export class SystemManager {

  static general: GeneralConfig 

  static updateGeneral(fieldsToUpdate: Partial<GeneralConfig>){
    const fieldsFiltered = SystemManager.#filterUndefinedProperties(fieldsToUpdate);
    SystemManager.#updateGeneralConfig(fieldsFiltered)
  }

  static #updateGeneralConfig(fieldsToUpdate: Partial<GeneralConfig>){
    const currentGeneralConfig = SystemManager.general;
    if (currentGeneralConfig) {
      for (const key in fieldsToUpdate) {
        if (key in currentGeneralConfig) {
          const keyConfig = key as keyof GeneralConfig;
          const keyValue = fieldsToUpdate[keyConfig]
          if ( keyValue !== undefined) {
            const updateFunction = GeneralUpdate.getFunction(keyConfig);
            updateFunction(currentGeneralConfig, keyValue);
          }
        }
      }
    }
  }

  static #filterUndefinedProperties<T extends ControllerConfig | GeneralConfig>( obj: Partial<T> ): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static async init() {
    try {
      const generalConfigs = await MySQL2.executeQuery<GeneralConfigRowData[]>({ sql: `SELECT nombreempresa AS COMPANY_NAME , correoadministrador AS EMAIL_ADMIN FROM general.configuracion LIMIT 1 OFFSET 0` });
      if(generalConfigs.length > 0){
        SystemManager.general= generalConfigs[0]
      }
    } catch (error) {
      genericLogger.error(`SystemManager | init | Error al inicializar configuración`,error);
    }
  }

}
