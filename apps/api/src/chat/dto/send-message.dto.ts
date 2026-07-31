import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
