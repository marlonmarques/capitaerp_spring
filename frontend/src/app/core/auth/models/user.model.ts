export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  jti?: string;
}

export interface TokenPayload {
  user_name: string;
  scope: string[];
  exp: number;
  authorities: string[];
  jti: string;
  client_id: string;
}
