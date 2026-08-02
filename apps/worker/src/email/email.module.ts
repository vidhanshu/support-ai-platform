import { Module } from "@nestjs/common";
import { EmailModule as RepoEmailModule } from "@repo/email";
import { EmailProcessor } from "./email.processor";

@Module({
  imports: [RepoEmailModule],
  providers: [EmailProcessor],
})
export class EmailModule {}
