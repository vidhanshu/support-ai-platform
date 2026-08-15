import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const ORIGIN_PATTERN = /^https?:\/\/[^/\s]+$/;

export class CreateAgentApiKeyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(ORIGIN_PATTERN, {
    each: true,
    message:
      "each allowedOrigin must be an http(s) origin without a path (e.g. https://example.com)",
  })
  allowedOrigins!: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  rateLimitRpm?: number;
}
