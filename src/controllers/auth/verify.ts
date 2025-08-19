import { NextFunction, Request, Response } from 'express';
import { Auth } from '../../models/auth';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';

import { appConfig } from '../../configs';
import { MqttService } from '../../services/mqtt/MqttService';

export const verify = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const refreshTokenCookie: string | undefined = req.cookies[appConfig.cookie.refresh_token.name];
  const refreshTokenHeader: string | undefined = req.headers.authorization;

  const refreshToken = refreshTokenCookie ?? (refreshTokenHeader !== undefined ? refreshTokenHeader.split(' ')[1] : undefined);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contraseña: contraseñaFound, ...userWithoutPassword } = userFound;

  const newAccessToken = await Auth.generateAccessToken({ id: userFound.u_id, rol: userFound.rol });
  // const newRefreshToken = await Auth.generateRefreshToken({ id: userFound.u_id, rol: userFound.rol });

  res.cookie(appConfig.cookie.access_token.name, newAccessToken, {
    httpOnly: true, // acceso solo del servidor
    // secure: process.env.NODE_ENV === "production", // acceso solo con https
    sameSite: 'strict', // acceso del mismo dominio
    // maxAge: 1000*60*60 // expiracion 1h
    maxAge: appConfig.jwt.access_token.expire,
  });

  // res.cookie(appConfig.cookie.refresh_token.name, newRefreshToken, {
  //   httpOnly: true, // acceso solo del servidor
  //   // secure: process.env.NODE_ENV === "production", // acceso solo con https
  //   sameSite: 'strict', // acceso del mismo dominio
  //   maxAge: appConfig.cookie.refresh_token.max_age, // expiracion 1d
  // });

  const credentialsMqtt = MqttService.getUserCredentials(userFound.rl_id);

  const response = {
    status: 200,
    message: 'Refresh token successful',
    data: {
      token_type: 'Bearer',
      access_token: newAccessToken,
      // refresh_token: newRefreshToken,
      user: userWithoutPassword,
      mqtt: {
        user: credentialsMqtt?.user,
        password: credentialsMqtt?.password,
        host: appConfig.mqtt.public_host,
        port: appConfig.mqtt.public_ws_port,
        protocol: appConfig.mqtt.public_ws_protocol,
        url: `${appConfig.mqtt.public_ws_protocol}://${appConfig.mqtt.public_host}:${appConfig.mqtt.public_ws_port}`,
      },
    },
  };

  res.status(200).json(response);
});
