import { DOCUMENT_CONFIGS } from "@repo/config";
import { IsIn, IsInt, IsString, Max } from "class-validator";

export class CreateUploadUrlDto {
  @IsString()
  originalName: string;

  @IsString()
  @IsIn(DOCUMENT_CONFIGS.ALLOWED_FILE_TYPES, {
    message: "File must be one of the 'pdf', 'docx', 'text', 'markdown'.",
  })
  contentType: string;

  @IsInt()
  @Max(DOCUMENT_CONFIGS.MAX_ALLOWED_FILE_SIZE)
  size: number;
}
