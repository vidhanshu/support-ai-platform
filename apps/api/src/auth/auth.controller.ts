import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JwtUser } from "./interfaces/jwt.interface";
import { LoginDto } from "./dtos/login.dto";
import { RefreshDto } from "./dtos/refresh.dto";
import { Authenticated } from "../common/decorators/authenticated.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @Post("login")
  async loginUser(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  async refreshToken(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post("logout")
  @Authenticated()
  async logout(@CurrentUser() user: JwtUser, @Body() dto: RefreshDto) {
    return this.authService.logout(user, dto);
  }

  @Post("logout-all")
  @Authenticated()
  async logoutAll(@CurrentUser() user: JwtUser) {
    return this.authService.logoutAll(user);
  }

  @Get("/me")
  @Authenticated()
  async me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.id)
  }
}
