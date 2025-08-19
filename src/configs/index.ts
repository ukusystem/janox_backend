import 'dotenv/config';
import { dbEnv } from './db.configs';
import { jwtEnv } from './jwt.configs';
import { emailEnv } from './email.configs';
import { serverEnv } from './server.configs';
import { PoolOptions } from 'mysql2';
import { encryptEnv } from './encrypt.configs';
import { cookieEnv } from './cookie.config';
import { mqttEnv } from './mqtt.config';

const zodEnv = jwtEnv.merge(dbEnv).merge(emailEnv).merge(serverEnv).merge(encryptEnv).merge(cookieEnv).merge(mqttEnv);

const result = zodEnv.safeParse(process.env);

if (!result.success) {
  const listErrors = result.error.errors.map((errorDetail) => ({
    message: errorDetail.message,
    status: errorDetail.code,
    path: errorDetail.path,
  }));
  console.log('Validación de variables de entorno fallida\n', listErrors);

  throw new Error(`Environment variable validation error:`);
}

const validatedEnv = result.data;

interface IAppConfig {
  node_env: 'development' | 'production' | 'test';
  server: {
    ip: string;
    port: number;
    manager_port: number;
  };
  jwt: {
    access_token: {
      secret: string;
      expire: number;
    };
    refresh_token: {
      secret: string;
      expire: number;
    };
    encrypt: {
      secret: string;
    };
  };
  cookie: {
    access_token: {
      name: string;
    };
    refresh_token: {
      name: string;
    };
  };
  encrypt: {
    secret: string;
    salt: string;
  };
  db: PoolOptions;
  email: {
    client_id: string;
    client_secret: string;
    redirect_uris: string;
    refresh_token: string;
  };
  system: {
    start_nvr: boolean;
    start_snapshot_motion: boolean;
    start_record_motion: boolean;
  };

  mqtt: {
    host: string;
    port: number;
    publish_timeout: number;
    public_host: string;
    public_ws_port: number;
    public_ws_protocol: string;

    users: {
      admin: {
        user: string;
        password: string;
      };
      manager: {
        user: string;
        password: string;
      };
      invited: {
        user: string;
        password: string;
      };
    };
  };
}

const appConfig: IAppConfig = {
  node_env: validatedEnv.NODE_ENV,
  server: {
    ip: validatedEnv.SERVER_IP,
    port: validatedEnv.SERVER_PORT,
    manager_port: validatedEnv.MANAGER_PORT,
  },
  jwt: {
    access_token: {
      secret: validatedEnv.ACCESS_TOKEN_SECRET,
      expire: validatedEnv.ACCESS_TOKEN_EXPIRE,
    },
    refresh_token: {
      secret: validatedEnv.REFRESH_TOKEN_SECRET,
      expire: validatedEnv.REFRESH_TOKEN_EXPIRE,
    },
    encrypt: {
      secret: validatedEnv.ENCRYPT_TOKEN_SECRET,
    },
  },
  cookie: {
    access_token: {
      name: validatedEnv.COOKIE_ACCESS_TOKEN_NAME,
    },
    refresh_token: {
      name: validatedEnv.COOKIE_REFRESH_TOKEN_NAME,
    },
  },
  encrypt: {
    secret: validatedEnv.ENCRYPT_SECRET_KEY,
    salt: validatedEnv.ENCRYPT_SALT,
  },
  db: {
    host: validatedEnv.DB_HOST,
    port: validatedEnv.DB_PORT,
    user: validatedEnv.DB_USER,
    password: validatedEnv.DB_PASSWORD,
    database: validatedEnv.DB_DATABASE,
    waitForConnections: validatedEnv.DB_WAIT_FOR_CONNECTIONS,
    connectionLimit: validatedEnv.DB_CONNECTION_LIMIT,
    maxIdle: validatedEnv.DB_MAX_IDLE,
    idleTimeout: validatedEnv.DB_IDLE_TIMEOUT,
    queueLimit: validatedEnv.DB_QUEUE_LIMIT,
    enableKeepAlive: validatedEnv.DB_ENABLE_KEEP_ALIVE,
    keepAliveInitialDelay: validatedEnv.DB_KEEP_ALIVE_INITIAL_DELAY,
  },
  email: {
    client_id: validatedEnv.EMAIL_CLIENT_ID,
    client_secret: validatedEnv.EMAIL_CLIENT_SECRET,
    redirect_uris: validatedEnv.EMAIL_REDIRECT_URIS,
    refresh_token: validatedEnv.EMAIL_REFRESH_TOKEN,
  },
  system: {
    start_nvr: validatedEnv.START_NVR,
    start_record_motion: validatedEnv.START_RECORD_MOTION,
    start_snapshot_motion: validatedEnv.START_SNAPSHOT_MOTION,
  },
  mqtt: {
    host: validatedEnv.MQTT_HOST,
    port: validatedEnv.MQTT_PORT,
    publish_timeout: validatedEnv.MQTT_PUBLISH_TIMEOUT,
    public_host: validatedEnv.MQTT_PUBLIC_HOST,
    public_ws_port: validatedEnv.MQTT_PUBLIC_WS_PORT,
    public_ws_protocol: validatedEnv.MQTT_PUBLIC_WS_PROTOCOL,
    users: {
      admin: {
        user: validatedEnv.MQTT_ADMIN_USER,
        password: validatedEnv.MQTT_ADMIN_PASSWORD,
      },
      manager: {
        user: validatedEnv.MQTT_MANAGER_USER,
        password: validatedEnv.MQTT_MANAGER_PASSWORD,
      },
      invited: {
        user: validatedEnv.MQTT_INVITED_USER,
        password: validatedEnv.MQTT_INVITED_PASSWORD,
      },
    },
  },
};

console.log('Configuraciones variables de entorno cargadas:\n', appConfig);

export { appConfig };
