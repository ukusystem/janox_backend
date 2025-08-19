import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { appConfig } from '../../configs';
import { RequestWithUser } from '../../types/requests';
import { Auth } from '../../models/auth';

export const logout = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const refreshTokenCookie: string | undefined = req.cookies[appConfig.cookie.refresh_token.name];
  const refreshTokenBody: string | undefined = req.body.refresh_token;

  const refreshToken = refreshTokenCookie ?? (refreshTokenBody !== undefined ? refreshTokenBody : undefined);

  if (refreshToken === undefined) {
    return res.status(400).json({ message: 'Token de actualización no proporcionado' });
  }

  const tokenPayload = await Auth.verifyRefreshToken(refreshToken);
  if (tokenPayload === null) {
    return res.status(401).json({ message: 'Token de actualización inválido o expirado' });
  }

  const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
  if (userFound === null) {
    return res.status(404).json({ message: 'Usuario no disponible' });
  }

  const refreshTokenStored = await Auth.getTokenStored(userFound.u_id, refreshToken);

  if (refreshTokenStored !== undefined) {
    // revocar token
    await Auth.revokeTokenById(refreshTokenStored.ut_id);
  }

  // Invalidar token
  res.clearCookie(appConfig.cookie.access_token.name);
  res.clearCookie(appConfig.cookie.refresh_token.name);

  res.status(200).json({ message: 'Sesión cerrada correctamente.' });
});
