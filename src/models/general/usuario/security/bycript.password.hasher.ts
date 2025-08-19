import { PasswordHasher } from './passwod.hasher';
import bcrypt from 'bcrypt';

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }
  async compare(password: string, hash_password: string): Promise<boolean> {
    return await bcrypt.compare(password, hash_password);
  }
}
