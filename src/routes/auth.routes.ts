import { Router } from 'express';
import { requestValidator } from '../middlewares/validator.middleware';
import { authController } from '../controllers/auth';
import { loginSchema, logoutSchema, refreshTokenSchema } from '../schemas/auth';

export const authRoutes = Router();

// Login POST /api/v1/auth/login
authRoutes.post('/auth/login', requestValidator({ body: loginSchema }), authController.login);

// Logout DELETE /api/v1/auth/logout
authRoutes.delete('/auth/logout', requestValidator({ body: logoutSchema }), authController.logout);

// VerifyToken GET /api/v1/auth/verify
authRoutes.get('/auth/verify', authController.verify);

// Refresh AccessToken /api/v1/auth/refresh-token
authRoutes.post('/auth/refresh-token', requestValidator({ body: refreshTokenSchema }), authController.refreshToken);

// ResetPassword POST "/auth/resetpassword"
authRoutes.post('/auth/resetpassword', authController.forgotPassword);
