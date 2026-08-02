import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ENV_KEYS } from "@repo/config";
import { Resend } from "resend";
import { EmailService } from "./email.service";

@Module({
  imports: [ConfigModule],
  providers: [
    EmailService,
    {
      provide: "RESEND_CLIENT",
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Resend(configService.getOrThrow<string>(ENV_KEYS.RESEND_API_KEY)),
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
