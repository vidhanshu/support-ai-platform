import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import {
  Prisma,
  PrismaService,
  UserTokenType,
  type User,
} from "@repo/database";
import bcrypt from "bcrypt";
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import dayjs from "dayjs";
import {
  BCRYPT_CONFIGS,
  EMAIL_CONFIGS,
  ENV_KEYS,
  JOB_NAMES,
  JWT_CONFIGS,
  QUEUE_NAMES,
} from "@repo/config";
import { LoginDto } from "./dtos/login.dto";
import { RefreshDto } from "./dtos/refresh.dto";
import type { JwtRefreshPayload, JwtUser } from "./interfaces/jwt.interface";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { EmailJobPayload } from "@repo/email";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue(QUEUE_NAMES.EMAIL)
    private readonly emailQueue: Queue<EmailJobPayload>,
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

  private async enqueueVerificationEmail(user: User) {
    await this.prisma.userToken.deleteMany({
      where: {
        userId: user.id,
        type: UserTokenType.EMAIL_VERIFICATION,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = dayjs()
      .add(EMAIL_CONFIGS.VERIFICATION_EXPIRATION_HOURS, "hour")
      .toDate();

    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        type: UserTokenType.EMAIL_VERIFICATION,
        token,
        expiresAt,
      },
    });

    const appWebUrl = this.configService.getOrThrow<string>(
      ENV_KEYS.APP_WEB_URL,
    );
    const verifyUrl = `${appWebUrl.replace(/\/$/, "")}/verify-email?token=${token}`;

    await this.emailQueue.add(
      JOB_NAMES.SEND_EMAIL,
      {
        kind: "verification",
        to: user.email,
        verifyUrl,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  }

  async createUser(dto: CreateUserDto) {
    try {
      const user = await this.createUserRecord(dto);
      await this.enqueueVerificationEmail(user);
  
      const { accessToken, refreshToken } = await this.issueTokens(user);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException(error.message);
      }

      this.logger.error(error);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.userToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.type !== UserTokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException("Invalid verification token");
    }

    if (record.usedAt || dayjs(record.expiresAt).isBefore(dayjs())) {
      await this.prisma.userToken.delete({
        where: { id: record.id },
      });
      throw new BadRequestException("Verification token expired");
    }

    if (record.user.emailVerifiedAt) {
      await this.prisma.userToken.deleteMany({
        where: {
          userId: record.userId,
          type: UserTokenType.EMAIL_VERIFICATION,
        },
      });
      return { verified: true };
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.userToken.deleteMany({
        where: {
          userId: record.userId,
          type: UserTokenType.EMAIL_VERIFICATION,
        },
      }),
    ]);

    return { verified: true };
  }

  async resendVerification(user: JwtUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) throw new UnauthorizedException();
    if (dbUser.emailVerifiedAt) {
      throw new BadRequestException("Email is already verified");
    }

    await this.enqueueVerificationEmail(dbUser);
    return { queued: true };
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
