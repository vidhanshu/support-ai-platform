import { IsIn, IsInt, IsString, Max } from "class-validator";
import { ALLOWED_FILE_TYPES, MAX_ALLOWED_FILE_SIZE } from "../configs";

export class CreateUploadUrlDto {
  @IsString()
  originalName: string;

  @IsString()
  @IsIn(ALLOWED_FILE_TYPES, {
    message: "File must be one of the 'pdf', 'docx', 'text', 'markdown'.",
  })
  contentType: string;

  @IsInt()
  @Max(MAX_ALLOWED_FILE_SIZE)
  size: number;
}
