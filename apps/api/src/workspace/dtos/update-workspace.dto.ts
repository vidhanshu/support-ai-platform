import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Slug must be lowercase letters, numbers, and hyphens (e.g. my-workspace)",
  })
  @MinLength(2)
  slug?: string;
}
