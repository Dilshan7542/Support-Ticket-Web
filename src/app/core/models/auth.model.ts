export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  departmentId?: string | number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string | number;
  encryptionKeyId?: string;
}

export interface AuthUser {
  id: string | number;
  name?: string;
  username?: string;
  role?: string;
}
