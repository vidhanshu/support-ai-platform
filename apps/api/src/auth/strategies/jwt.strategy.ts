import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ENV_KEYS } from "@repo/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt.interface";
import { PrismaService } from "@repo/database";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>(ENV_KEYS.JWT_ACCESS_SECRET),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
