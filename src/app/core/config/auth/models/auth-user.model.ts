export interface AuthUser {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
}