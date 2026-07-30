export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtUser extends JwtPayload {
  email: string;
}
