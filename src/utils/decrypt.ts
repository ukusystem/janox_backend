import crypto from 'crypto';
import { appConfig } from '../configs';
import { genericLogger } from '../services/loggers';

export function decrypt(strToDecrypt: string): string {
  try {
    const key = crypto.pbkdf2Sync(appConfig.encrypt.secret, appConfig.encrypt.salt, 65536, 32, 'sha256');
    const iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(strToDecrypt, 'base64');
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    genericLogger.error(`Decrypt | Error al desencriptar`, error);
    throw error;
  }
}
