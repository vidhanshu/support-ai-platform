import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { Prisma, PrismaService, type User } from "@repo/database";
import bcrypt from "bcrypt";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import dayjs from "dayjs";
import { BCRYPT_CONFIGS, ENV_KEYS, JWT_CONFIGS } from "@repo/config";
import { LoginDto } from "./dtos/login.dto";
import { RefreshDto } from "./dtos/refresh.dto";
import type { JwtRefreshPayload, JwtUser } from "./interfaces/jwt.interface";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async createUserRecord(dto: CreateUserDto): Promise<User> {
    const { email, password } = dto;

    // existence check
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (user?.id)
      throw new ConflictException("User with the email already exists");

    const hash = await this.hashPassword(password);

    // extra check in case of the race condition where user A and B hits the register at the same time with same email
    try {
      const createdUser = await this.prisma.user.create({
        data: { email, passwordHash: hash },
      });

      return createdUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("User with the email already exists");
        }
      }
      throw error;
    }
  }

  private async generateTokens(user: JwtUser, jti: string) {
    const payload = { sub: user.id, email: user.email };
    const refreshPayload = { ...payload, jti };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>(ENV_KEYS.JWT_ACCESS_SECRET),
      expiresIn: `${JWT_CONFIGS.ACCESS_TOKEN_MINS}m`,
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>(
        ENV_KEYS.JWT_REFRESH_SECRET,
      ),
      expiresIn: `${JWT_CONFIGS.REFRESH_TOKEN_DAYS}d`,
    });
    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(id: string, token: string, jti: string) {
    const hashRefreshToken = await this.hashPassword(token);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken,
        expiresAt: new Date(
          dayjs().add(JWT_CONFIGS.REFRESH_TOKEN_DAYS, "days").toISOString(),
        ),
        userId: id,
        jti,
      },
    });
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, BCRYPT_CONFIGS.SALT_ROUND);
  }

  private async verifyHash(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  private async issueTokens(user: User) {
    const jti = crypto.randomUUID();
    const { accessToken, refreshToken } = await this.generateTokens(user, jti);
    await this.persistRefreshToken(user.id, refreshToken, jti);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string, ignoreExpiration = false) {
    const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
      token,
      {
        secret: this.configService.getOrThrow(ENV_KEYS.JWT_REFRESH_SECRET),
        ignoreExpiration,
      },
    );

    const dbRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      select: {
        id: true,
        user: true,
        tokenHash: true,
      },
    });

    if (!dbRefreshToken) {
      throw new UnauthorizedException();
    }

    if (dbRefreshToken.user.id !== payload.sub) {
      throw new UnauthorizedException();
    }

    const isValid = await this.verifyHash(token, dbRefreshToken.tokenHash);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return dbRefreshToken;
  }

  private async revoke(tokenId: string) {
    // delete the current refresh token - for token rotation
    await this.prisma.refreshToken.delete({
      where: { id: tokenId },
    });
  }

  private async revokeAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async revokeExpired(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, expiresAt: { lte: new Date() } },
    });
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.createUserRecord(dto);

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Email or Password is wrong");
    if (!user.passwordHash) throw new UnauthorizedException();

    const isValid = await this.verifyHash(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException("Email or Password is wrong");

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshDto) {
    const { refreshToken } = dto;
    try {
      const dbRefreshToken = await this.verifyRefreshToken(refreshToken);

      await this.revoke(dbRefreshToken.id);

      return this.issueTokens(dbRefreshToken.user);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException();
      }

      throw error;
    }
  }

  async logout(user: JwtUser, dto: RefreshDto) {
    const { refreshToken } = dto;

    const session = await this.verifyRefreshToken(refreshToken, true);

    if (session.user.id !== user.id) {
      throw new UnauthorizedException();
    }

    await this.revoke(session.id);

    await this.revokeExpired(user.id);
  }

  async logoutAll(user: JwtUser) {
    const { id: userId } = user;
    await this.revokeAll(userId);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      omit: { passwordHash: true },
    });
  }
}
