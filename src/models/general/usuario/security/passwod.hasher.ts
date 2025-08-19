export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash_password: string): Promise<boolean>;
}
