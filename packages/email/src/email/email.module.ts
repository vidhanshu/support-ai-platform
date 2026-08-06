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
      useFactory: (configService: ConfigService) => {
        const provider = (
          configService.get<string>(ENV_KEYS.EMAIL_PROVIDER) ?? "resend"
        ).toLowerCase();
        if (provider === "console") return null;

        const apiKey = configService.get<string>(ENV_KEYS.RESEND_API_KEY);
        if (!apiKey) {
          throw new Error(
            "RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
          );
        }
        return new Resend(apiKey);
      },
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
