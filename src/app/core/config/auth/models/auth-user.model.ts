export interface AuthUser {
  id: number;
  username: string;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
}