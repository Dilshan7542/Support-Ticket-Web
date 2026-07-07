export type UserRole = 'CUSTOMER' | 'VIEWER' | 'EDITOR' | 'SUPER_ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string | number;
  encryptionKeyId?: string;
  username?: string;
  fullName?: string;
  role?: UserRole;
}

export interface AuthUser {
  id: string | number;
  name?: string;
  username?: string;
  role?: UserRole;
}
