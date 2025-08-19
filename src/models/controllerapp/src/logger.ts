import {Mutex} from 'async-mutex'
import path from 'path'
import * as Useful from './useful'
import fs from 'fs'

/**
 * A class to write messages to a file and print it on screen
 */
export class Logger {
  static readonly MAX_LEVEL = 9;
  static readonly  ALLOW_PRINT = process.env.ALLOW_OUTPUT_TO_CMD === 'true'

  private static readonly BASE_FILENAME = "log_";
  private static readonly FILE_EXTENSION = ".txt";
  private static readonly NO_LOGGER_MESSAGE = "<Logger write error> ";

  private readonly loggerLock = new Mutex();

  #minLevel = 0;
  #errorShown = false;
  #filePath = "./default_log.txt";

  /**
   * Create a Logger object
   * @param name         Name to use in the filename.
   * @param folderPath   Path of the parent folder of file to log in.
   * @param minimumLevel Minimum level of the messages to be valid for printing and logging.
   */
  constructor(name: string, folderPath: string, minimumLevel: number = 0) {
    this.#minLevel = minimumLevel;
    this.#filePath = path.join(folderPath, Logger.BASE_FILENAME + name + Logger.FILE_EXTENSION);
  }

  /**
   * Log a message to a file. Can also print the message.
   * @param message The message to log and print.
   * @param level The level of the message, which has to be a minimum to be considered to log and print.
   * @param print Whether to print the message on screen.
   */
  private async logComplete(level: number, print: boolean, format: string) {
    if (level >= this.#minLevel) {
      let success = true;
      const date = Useful.getCurrentDate();
      // const midMessage = util.format("[%s] %s", date, format);
      const message = `[${date}] ${format}`;
      await this.loggerLock.runExclusive(async () => {
        try {
          // Log to file
          fs.appendFileSync(this.#filePath, message + "\n");
        } catch (e) {
          success = false;
          if (!this.#errorShown) {
            console.log(Logger.NO_LOGGER_MESSAGE + "Error opening or writing to file.");
            console.log(e);
            this.#errorShown = true;
          }
        }
      });

      if (print && Logger.ALLOW_PRINT) {
        if (!success) {
          console.log(Logger.NO_LOGGER_MESSAGE + "\n");
        }
        console.log(message);
      }
    }
  }

  /**
   * Same as {@linkcode logComplete} but `level` defaults to {@linkcode MAX_LEVEL} and `print` defaults to `true`
   * @param message
   */
  async log(message: string) {
    await this.logComplete(Logger.MAX_LEVEL, true, message);
  }

  // /**
  //  * Log a message with the maximum level of importance
  //  * @param message
  //  * @param print
  //  */
  // public void log(boolean print, String message, Object ... args) {
  // 	log(MAX_LEVEL, print, message, args);
  // }
}