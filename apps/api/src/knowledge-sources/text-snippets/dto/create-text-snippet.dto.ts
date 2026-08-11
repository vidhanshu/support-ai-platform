import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { TEXT_SNIPPET_CONFIGS } from "@repo/config";

export class CreateTextSnippetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(TEXT_SNIPPET_CONFIGS.MAX_TITLE_LENGTH)
  title: string;

  /** Rich HTML from the editor */
  @IsString()
  @IsNotEmpty()
  contentHtml: string;
}
