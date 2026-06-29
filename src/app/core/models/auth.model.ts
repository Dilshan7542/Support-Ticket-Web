export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  departmentId?: string | number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string | number;
}

export interface AuthUser {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
}
