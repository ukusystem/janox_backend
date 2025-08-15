import crypto from 'crypto';
import { appConfig } from '../configs';

export class JwtEncription {
  static readonly secretKey: Uint8Array = new Uint8Array(crypto.createHash('sha256').update(appConfig.jwt.encrypt.secret).digest()); // Hash a 32 bytes

  static readonly iv: Uint8Array = new Uint8Array(16); // IV debe ser de 16 bytes

  static encrypt(token: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', JwtEncription.secretKey, JwtEncription.iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static decrypt(encrypted_token: string) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', JwtEncription.secretKey, JwtEncription.iv);
    let decrypted = decipher.update(encrypted_token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
