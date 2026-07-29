import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { Prisma, PrismaService, type User } from "@repo/database";
import bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import dayjs from "dayjs";
import { BCRYPT_CONFIGS, ENV_KEYS, JWT_CONFIGS } from "@repo/config";

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

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>(ENV_KEYS.JWT_ACCESS_SECRET),
      expiresIn: `${JWT_CONFIGS.ACCESS_TOKEN_MINS}m`,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>(
        ENV_KEYS.JWT_REFRESH_SECRET,
      ),
      expiresIn: `${JWT_CONFIGS.REFRESH_TOKEN_DAYS}d`,
    });
    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(id: string, token: string) {
    const hashRefreshToken = await this.hashPassword(token);

    try {
      await this.prisma.refreshToken.create({
        data: {
          tokenHash: hashRefreshToken,
          expiresAt: new Date(
            dayjs().add(JWT_CONFIGS.REFRESH_TOKEN_DAYS, "days").toISOString(),
          ),
          userId: id,
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, BCRYPT_CONFIGS.SALT_ROUND);
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.createUserRecord(dto);

    const { accessToken, refreshToken } = await this.generateTokens(user);

    await this.persistRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
