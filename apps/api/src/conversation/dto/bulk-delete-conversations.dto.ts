import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class BulkDeleteConversationsDto {
  @IsUUID()
  agentId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  ids: string[];
}
