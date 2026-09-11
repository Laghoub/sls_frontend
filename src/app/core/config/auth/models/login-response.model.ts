import { AuthUser } from './auth-user.model';

export interface LoginResponse {
  message: string;
  user: AuthUser;
}