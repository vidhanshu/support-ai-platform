import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@repo/config";
import { InvitationsService } from "./invitations.service";
import { InvitationsController } from "./invitations.controller";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.EMAIL,
    }),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
