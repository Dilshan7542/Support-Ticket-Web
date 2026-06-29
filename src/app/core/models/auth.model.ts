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
  role?: string;
}

export interface AuthUser {
  id: string | number;
  name?: string;
  username?: string;
  role?: string;
}
