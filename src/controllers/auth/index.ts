import { login } from "./login";
import { logout } from "./logout";
import {forgotPassword} from './forgotPassword'
import { verify } from "./verify";
import {refreshToken} from './refresh.token'

export const authController = {
  login,
  logout,
  forgotPassword,
  verify,
  refreshToken
};
