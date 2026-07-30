import { WorkspaceRole } from "@repo/database";
import { IsEmail, IsEnum } from "class-validator";

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum({
    MEMBER: WorkspaceRole.MEMBER,
    ADMIN: WorkspaceRole.ADMIN,
  })
  role: Omit<WorkspaceRole, "OWNER">;
}
