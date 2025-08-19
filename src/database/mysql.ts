import { createPool, Pool ,PoolConnection,QueryOptions, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import * as queries from '../models/controllerapp/src/queries'
import { appConfig } from "../configs";
import { genericLogger } from "../services/loggers";

export class MySQL2 {
  private static instance: MySQL2;
  private static pool: Pool;

  private constructor() {}

  static async create() {
    try {
      if (!MySQL2.instance) {
        genericLogger.info("Creando instacia MySQL2");
        MySQL2.instance = new MySQL2();
      }

      const pool = createPool(appConfig.db);
      // Testear conexion
      const connection = await pool.getConnection(); // Crear conexión
      connection.release(); // Liberar la conexión
      // Establecer pool
      MySQL2.pool = pool;
      genericLogger.info(`Conexión establecida con éxito a la base de datos. | host: ${appConfig.db.host} | port: ${appConfig.db.port}`);

      return MySQL2.instance;
    } catch (error) {
      genericLogger.error(`No se pudo establecer conexión con la base de datos. | host: ${appConfig.db.host} | port: ${appConfig.db.port}`);
      throw error;
    }
  }

  static get getInstance(): MySQL2 {
    if (!MySQL2.instance) {
      genericLogger.info("Creando instacia MySQL2");
      MySQL2.instance = new MySQL2();
    }
    return MySQL2.instance;
  }

  static async getConnection(): Promise<PoolConnection> {
    const connection = await MySQL2.pool.getConnection();
    return connection;
  }

  static releaseConnection(connection: PoolConnection) {
    connection.release(); // Liberar la conexión
  }

  static async executeQuery<T extends RowDataPacket[] | ResultSetHeader>(queryOptions: QueryOptions, config:boolean = false) {
    const connection = await MySQL2.getConnection();
    if(config){
      await connection.query<ResultSetHeader>(queries.setStatExpiry);
    }
    try {
      const [result] = await connection.query<T>(queryOptions);
      connection.release();
      return result;
    } catch (error) {
      connection.release();
      throw error
    }
  }
}