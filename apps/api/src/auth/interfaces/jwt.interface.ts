export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtRefreshPayload extends JwtPayload {
  jti: string;
}

export interface JwtUser {
  id: string;
  email: string;
}
