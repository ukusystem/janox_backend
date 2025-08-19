
import winston ,{format} from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';
import { appConfig } from "../configs";

export type LogMessage = string;

export type LogContext = any;

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export class Logger {

  #logger: winston.Logger;
  #appName: string;

  constructor(appName: string){
    this.#appName = appName;
    this.#logger = this.#initializeWinston()
  }

  #initializeWinston() {
    const logger = winston.createLogger({
      level: appConfig.node_env === 'production' ? 'info' : 'debug',
      transports: this.#getTransports(),
    });
    return logger;
  }

  #getTransports() {
    const transports : winston.transport[] = [
      new winston.transports.Console({
        format: this.#getFormatForConsole(),
        level: appConfig.node_env === 'production' ? 'info' : 'debug'
      }),
    ];
    
    if (appConfig.node_env === 'production') {
      transports.push(this.getFileTransport()); // Include file transport in production
    }

    return transports;
  }

  #getFormatForConsole() {
    return format.combine(
      format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
      // format.align(),
      format.printf(
        info =>
          `[${info.timestamp}] [${this.#appName}] [${info.level.toUpperCase()}]: ${info.message}`
      ),
    );
  }

  private getFileTransport() {
    return new DailyRotateFile({
      filename: `${this.#appName}-%DATE%.log`,
      zippedArchive: true, // Compress gzip
      maxSize: '20m', // Rotate after 20MB
      // maxFiles: '14d', // Only keep last 14 days
      datePattern: 'YYYY-MM-DD',
      format: format.combine(
        format.timestamp({format: "YYYY-MM-DD hh:mm:ss"}),
        format(info => {
          info.app = this.#appName;
          return info;
        })(),
        format.json()
      ),
      dirname:`./logs/${this.#appName}/`,
      level: "info"

    });
  }

  #logWinston( level: LogLevel,msg: LogMessage, context?: LogContext) {
    this.#logger.log({level: level, message: msg, xcontext: context});
  }

  public info(msg: LogMessage, context?: LogContext) {
    this.#logWinston(LogLevel.INFO,msg,context);
  }
  public warn(msg: LogMessage, context?: LogContext) {
    this.#logWinston(LogLevel.WARN,msg, context);
  }
  public error(msg: LogMessage, context?: LogContext) {
    this.#logWinston(LogLevel.ERROR,msg, context);
  }
  public debug(msg: LogMessage, context?: LogContext) {
    if (appConfig.node_env !== 'production') {
      this.#logWinston(LogLevel.DEBUG,msg, context); // Don't log debug in production
    }
  }
}