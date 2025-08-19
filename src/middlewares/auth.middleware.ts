import { Request, Response, NextFunction } from 'express';
import { Auth, JwtPayload, UserInfo } from '../models/auth';
import { asyncErrorHandler } from '../utils/asynErrorHandler';
import { CustomError } from '../utils/CustomError';
import { RequestWithUser } from '../types/requests';
import { appConfig } from '../configs';
import { UserRol } from '../types/rol';
import { Socket } from 'socket.io';
import { socketHandShakeSchema } from '../schemas/auth/socket.handshake';
// import { socketHandShakeSchema } from '../schemas/auth/socket.handshake';

export interface CustomRequest extends Request {
  user?: UserInfo;
}

const getCookies = (cookie: string | undefined, keys: string[]): Record<string, string> => {
  if (cookie === undefined) {
    return {};
  }
  const cookies = cookie.split('; ').reduce<Record<string, string>>((acc, cookie) => {
    const [key, value] = cookie.split('=');
    if (keys.includes(key)) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  return cookies;
};

export const socketAuthWithRoles = (allowedRoles: UserRol[]) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const cookies = getCookies(socket.request.headers.cookie, [appConfig.cookie.refresh_token.name, appConfig.cookie.access_token.name]);

      const refreshTokenCookie = cookies[appConfig.cookie.refresh_token.name];
      let accessTokenHeader = undefined;

      const result = socketHandShakeSchema.safeParse(socket.handshake.auth);
      if (result.success) {
        accessTokenHeader = result.data.token;
      }

      const accesssToken = refreshTokenCookie ?? accessTokenHeader;

      if (accesssToken === undefined) {
        return next(new Error('Token de acceso no proporcionado'));
      }

      let tokenPayload: JwtPayload | null = null;
      if (refreshTokenCookie) {
        tokenPayload = await Auth.verifyRefreshToken(accesssToken);
      } else {
        tokenPayload = await Auth.verifyAccessToken(accesssToken);
      }

      if (!tokenPayload) {
        return next(new Error('Token de acceso inválido o expirado'));
      }

      const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
      if (!userFound) {
        return next(new Error('Usuario no disponible'));
      }

      if (!allowedRoles.some((rol) => rol === userFound.rl_id)) {
        console.log('Acceso denegado: No tienes los permisos necesarios.');
        return next(new Error('Acceso denegado: No tienes los permisos necesarios.'));
      }

      socket.data.user = userFound;

      next();
    } catch (error) {
      if (error instanceof Error) {
        return next(new Error(error.message));
      }
      next(new Error('Error interno en autenticación/verificación de roles'));
    }
  };
};

export const authenticate = asyncErrorHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const accessTokenCookie: string | undefined = req.cookies[appConfig.cookie.access_token.name];
  const refreshTokenCookie: string | undefined = req.cookies[appConfig.cookie.refresh_token.name];
  const accessTokenHeader: string | undefined = req.headers.authorization !== undefined ? req.headers.authorization.split(' ')[1] : undefined;

  if (accessTokenCookie === undefined && accessTokenHeader === undefined && refreshTokenCookie === undefined) {
    return res.status(401).json({ message: 'Token de acceso no proporcionado' });
  }

  const accesssToken = refreshTokenCookie ?? accessTokenCookie ?? accessTokenHeader;

  let tokenPayload: JwtPayload | null = null;
  if (refreshTokenCookie) {
    tokenPayload = await Auth.verifyRefreshToken(accesssToken);
  } else {
    tokenPayload = await Auth.verifyAccessToken(accesssToken);
  }

  if (tokenPayload === null) {
    return res.status(401).json({ message: 'Token de acceso inválido o expirado' });
  }

  const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
  if (userFound === null) {
    return res.status(404).json({ message: 'Usuario no disponible' });
  }

  req.user = userFound;

  next();
});

export const rolChecker = (allowedRoles: UserRol[]) =>
  asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user === undefined) {
      const userNotAuthenticaded = new CustomError(`Usuario no autentificado`, 401, 'Unauthorized');
      throw userNotAuthenticaded;
    }

    if (!allowedRoles.some((rol) => rol === user.rl_id)) {
      const accessDeniedError = new CustomError(`No tienes los permisos necesarios para acceder al recurso.`, 403, 'Acceso denegado');
      throw accessDeniedError;
    }

    next();
  });
