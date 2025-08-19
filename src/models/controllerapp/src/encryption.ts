import * as crypto from 'crypto';
import { appConfig } from '../../../configs';

export class Encryption {
  private static readonly KEY_LENGTH = 32;
  private static readonly ITERATION_COUNT = 65536;

  private static getKey(): Buffer {
    return crypto.pbkdf2Sync(appConfig.encrypt.secret, appConfig.encrypt.salt, Encryption.ITERATION_COUNT, Encryption.KEY_LENGTH, 'sha256');
  }

  /**
   * Encrypt a string using the AES algorithm (PBKDF2WithHmacSHA256).
   *
   * @param strToEncrypt String to encrypt in utf8.
   * @param withRandom   True to use a random array of bytes and generate
   *                     different results each time. The decryption must also use
   *                     the same value in order to get the original text back.
   * @return The encrypted string in base 64 or null if an error occurred.
   */
  static encrypt(strToEncrypt: string, withRandom: boolean): string | null {
    try {
      let iv: Buffer = Buffer.from('');
      if (withRandom) {
        iv = crypto.randomBytes(16);
      } else {
        iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }
      // console.log(`Encrypt iv hex '${iv.toString('hex')}'`)
      const cipher = crypto.createCipheriv('aes-256-cbc', this.getKey(), iv);
      // cipher.setAutoPadding(false)
      let crypted = Buffer.concat([cipher.update(strToEncrypt, 'utf8'), cipher.final()]);
      if (withRandom) {
        crypted = Buffer.concat([iv, crypted]);
      }
      //   console.log(`Encrypted hex '${crypted.toString('hex')}'`)
      return crypted.toString('base64'); // +fHL53d9GKUS842X7U+hlA==
    } catch (e) {
      console.log(`Error encrypting. ${e}`);
    }
    return null;
  }

  /**
   * Decrypt a string using the AES algorithm (PBKDF2WithHmacSHA256).
   *
   * @param strToEncrypt String to dencrypt in base64.
   * @param withRandom   The value must be the same as when the original text was
   *                     encrypted.
   * @return The original string or null if an error occurred.
   */
  static decrypt(strToDecrypt: string, withRandom: boolean): string | null {
    try {
      // Encrypted to buffer
      const ori = Buffer.from(strToDecrypt, 'base64');
      //   console.log(`Hex: '${ori.toString("hex")}'     ${ori.length}`);

      // Extract vector or use a default one
      let iv = Buffer.allocUnsafe(16);
      if (withRandom) {
        ori.copy(iv, 0, 0, 16);
        // console.log(`Decrypt iv: '${iv.toString("hex")}'    ${iv.length}`);
      } else {
        iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }

      // Create decipher
      // console.log("Before create decipher")
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.getKey(), iv);
      // decipher.setAutoPadding(false)
      // Get decrypted
      let decrypted; // Buffer.allocUnsafe(1)
      if (withRandom) {
        const cipherText = Buffer.allocUnsafe(ori.length - 16);
        // Copy the rest of the text
        ori.copy(cipherText, 0, 16, ori.length);
        // console.log(`Cipher text '${cipherText.toString("hex")}'     ${cipherText.length}`);
        // console.log("Before update")
        decrypted = decipher.update(cipherText);
        // decrypted = decipher.update(strToDecrypt, 'base64');
      } else {
        decrypted = decipher.update(strToDecrypt, 'base64');
      }
      //   console.log(`Decrypted text hex '${decrypted.toString("hex")}'`);

      //   console.log("Before final");
      const a = decipher.final();
      //   console.log(`Decrypt final '${a.toString()}'`);
      // console.log("Before concat")
      decrypted = Buffer.concat([decrypted, a]);
      // console.log('Before return')
      return decrypted.toString('utf8');
    } catch (e) {
      console.log(`Error decrypting. ${e}`);
    }
    return null;
  }
}
