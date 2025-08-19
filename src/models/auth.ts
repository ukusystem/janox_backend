import { MySQL2 } from '../database/mysql';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { simpleErrorHandler } from '../utils/simpleErrorHandler';

import { Cargo, Contrata, Personal, Rol, Rubro, Usuario } from '../types/db';
import { appConfig } from '../configs';
import dayjs from 'dayjs';
import { JwtEncription } from '../utils/jwt.encription';

export interface JwtPayload {
  iat: number;
  exp: number;
  id: number;
  rol: string;
}

export type UserInfo = Pick<Usuario, 'u_id' | 'usuario' | 'contraseña' | 'rl_id' | 'fecha' | 'p_id'> &
  Pick<Personal, 'nombre' | 'apellido' | 'dni' | 'telefono' | 'correo' | 'c_id' | 'foto'> &
  Pick<Contrata, 'contrata' | 'co_id'> &
  Pick<Rubro, 'rubro'> &
  Pick<Rol, 'rl_id' | 'rol' | 'descripcion'> &
  Pick<Cargo, 'cargo'>;

interface UserFound extends RowDataPacket, UserInfo {}

export interface UserToken {
  ut_id: number;
  user_id: number;
  refresh_token: string;
  issued_at: string;
  expires_at: string;
  revoked: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at?: string;
}

interface UserTokenRowData extends RowDataPacket, UserToken {}

export interface CreateUserTokenDTO {
  user_id: number;
  refresh_token: string;
  issued_at: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}

export class Auth {
  static findUser = simpleErrorHandler<UserInfo | null, Pick<Usuario, 'usuario'>>(async ({ usuario }) => {
    const userFound = await MySQL2.executeQuery<UserFound[]>({
      sql: `SELECT u.u_id, u.usuario, u.contraseña, u.rl_id, u.fecha, u.p_id, p.nombre, p.apellido, p.dni, p.telefono, p.correo, p.c_id, p.foto, c.contrata , c.co_id, c.r_id, ru.rubro, r.rol, r.descripcion, ca.cargo FROM general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id INNER JOIN general.contrata c ON p.co_id = c.co_id INNER JOIN general.rubro ru ON c.r_id = ru.r_id INNER JOIN general.cargo ca ON p.c_id = ca.c_id WHERE u.usuario = ?  AND u.activo = 1`,
      values: [usuario],
    });

    if (userFound.length > 0) {
      return userFound[0];
    }

    return null;
  }, 'Auth.findUser');

  private static decodeToken(token: string): JwtPayload {
    const result = jwt.decode(token, { json: true });
    if (result === null) {
      throw new Error('Error al decodificar token');
    }
    return result as JwtPayload;
  }

  static async createUserToken(user_id: number, refresh_token: string, ip?: string, user_agent?: string) {
    const tokenPayload = Auth.decodeToken(refresh_token);
    const refresh_token_encrypt = JwtEncription.encrypt(refresh_token);
    const issued_at = dayjs(tokenPayload.iat * 1000).format('YYYY-MM-DD HH:mm:ss');
    const expires_at = dayjs(tokenPayload.exp * 1000).format('YYYY-MM-DD HH:mm:ss');

    const created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await MySQL2.executeQuery<ResultSetHeader>({
      sql: `INSERT INTO general.user_token ( user_id , refresh_token , issued_at , expires_at , revoked , ip_address , user_agent , created_at , updated_at ) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? )`,
      values: [user_id, refresh_token_encrypt, issued_at, expires_at, 0, ip, user_agent, created_at, undefined],
    });
  }

  static async revokeTokenById(ut_id: number) {
    const updated_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
    await MySQL2.executeQuery<ResultSetHeader>({
      sql: `UPDATE general.user_token SET revoked = ? , updated_at = ? WHERE ut_id = ? LIMIT 1`,
      values: [1, updated_at, ut_id],
    });
  }

  static async getTokenStored(user_id: number, refresh_token_input: string): Promise<UserToken | undefined> {
    const curDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user_tokens = await MySQL2.executeQuery<UserTokenRowData[]>({
      sql: `SELECT * FROM general.user_token WHERE user_id = ? AND revoked = 0 AND expires_at > '${curDate}'`,
      values: [user_id],
    });
    for (const token of user_tokens) {
      const refresh_token_decrypted = JwtEncription.decrypt(token.refresh_token);

      const isMatch = refresh_token_input === refresh_token_decrypted;
      if (isMatch) {
        return token;
      }
    }

    return undefined;
  }

  static findUserById = simpleErrorHandler<UserInfo | null, Pick<Usuario, 'u_id'>>(async ({ u_id }) => {
    const userFound = await MySQL2.executeQuery<UserFound[]>({
      sql: `SELECT u.u_id, u.usuario, u.contraseña, u.rl_id, u.fecha, u.p_id, p.nombre, p.apellido, p.dni, p.telefono, p.correo, p.c_id, p.foto, c.contrata , c.co_id, c.r_id, ru.rubro, r.rol, r.descripcion, ca.cargo FROM general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id INNER JOIN general.contrata c ON p.co_id = c.co_id INNER JOIN general.rubro ru ON c.r_id = ru.r_id INNER JOIN general.cargo ca ON p.c_id = ca.c_id WHERE u.u_id = ? AND u.activo = 1`,
      values: [u_id],
    });

    if (userFound.length > 0) {
      return userFound[0];
    }

    return null;
  }, 'Auth.findUserById');

  static generateAccessToken = simpleErrorHandler<string, string | object | Buffer>((payload) => {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, appConfig.jwt.access_token.secret, { expiresIn: appConfig.jwt.access_token.expire / 1000 }, (err, token) => {
        if (err) reject(err);
        if (token !== undefined) {
          resolve(token);
        } else {
          reject(new Error('Token is undefined'));
        }
      });
    });
  }, 'Auth.generateAccessToken');

  static generateRefreshToken = simpleErrorHandler<string, string | object | Buffer>((payload) => {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, appConfig.jwt.refresh_token.secret, { expiresIn: appConfig.jwt.refresh_token.expire / 1000 }, (err, token) => {
        if (err) reject(err);
        if (token !== undefined) {
          resolve(token);
        } else {
          reject(new Error('Token is undefined'));
        }
      });
    });
  }, 'Auth.generateRefreshToken');

  static verifyAccessToken = simpleErrorHandler<JwtPayload | null, string>((token) => {
    return new Promise((resolve, _reject) => {
      jwt.verify(token, appConfig.jwt.access_token.secret, (err, user) => {
        if (err) {
          resolve(null);
        }
        resolve(user as JwtPayload);
      });
    });
  }, 'Auth.verifyAccessToken');

  static verifyRefreshToken = simpleErrorHandler<JwtPayload | null, string>((token) => {
    return new Promise((resolve, _reject) => {
      jwt.verify(token, appConfig.jwt.refresh_token.secret, (err, user) => {
        if (err) {
          resolve(null);
        }
        resolve(user as JwtPayload);
      });
    });
  }, 'Auth.verifyAccessToken');
}
