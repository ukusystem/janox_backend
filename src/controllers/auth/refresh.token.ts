import { NextFunction, Request, Response } from 'express';
import { Auth } from '../../models/auth';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { appConfig } from '../../configs';

export const refreshToken = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const refreshTokenCookie: string | undefined = req.cookies[appConfig.cookie.refresh_token.name];
  const refreshTokenBody: string | undefined = req.body.refresh_token;

  const refreshToken = refreshTokenCookie ?? (refreshTokenBody !== undefined ? refreshTokenBody : undefined);

  if (refreshToken === undefined) {
    return res.status(401).json({ message: 'Token de actualización no proporcionado.' });
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

  if (refreshTokenStored === undefined) {
    return res.status(401).json({
      message: 'Token de actualización no registrado',
    });
  }

  const newAccessToken = await Auth.generateAccessToken({ id: userFound.u_id, rol: userFound.rol });
  // const newRefreshToken = await Auth.generateRefreshToken({ id: userFound.u_id, rol: userFound.rol });

  // revocar token anterior
  // await Auth.revokeTokenById(refreshTokenStored.ut_id);
  // registror token
  // await Auth.createUserToken(userFound.u_id, newRefreshToken, req.ip, req.get('user-agent'));

  res.cookie(appConfig.cookie.access_token.name, newAccessToken, {
    httpOnly: true, // acceso solo del servidor
    // secure: process.env.NODE_ENV === "production", // acceso solo con https
    sameSite: 'strict', // acceso del mismo dominio
    maxAge: appConfig.jwt.access_token.expire,
  });

  // res.cookie(appConfig.cookie.refresh_token.name, newRefreshToken, {
  //   httpOnly: true, // acceso solo del servidor
  //   // secure: process.env.NODE_ENV === "production", // acceso solo con https
  //   sameSite: 'strict', // acceso del mismo dominio
  //   maxAge: appConfig.cookie.refresh_token.max_age, // expiracion 1d
  // });

  const response = {
    status: 200,
    message: 'Refresh token successful',
    data: {
      token_type: 'Bearer',
      access_token: newAccessToken,
      // refresh_token: newRefreshToken,
    },
  };

  res.status(200).json(response);
});
