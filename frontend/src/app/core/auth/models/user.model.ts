export interface Role {
  id: number;
  authority: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: Role[];
  filialId?: string;
  filiais?: any[]; // Pode ser tipado como Filial[] se importar de filial.model.ts
  permissions?: string[];
}

export interface LoginRequest {
  tenantIdentifier: string;
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
  sub: string;
  username: string;
  scope: string;
  exp: number;
  authorities: string[];
  jti: string;
  client_id?: string;
}
