import { Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import {
  MembersController,
  WorkspaceController,
} from "./workspace.controller";

@Module({
  controllers: [WorkspaceController, MembersController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
