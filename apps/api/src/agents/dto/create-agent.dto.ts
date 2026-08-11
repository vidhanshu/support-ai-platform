import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { AGENT_MODEL_IDS } from "@repo/config";

export class CreateAgentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  generalPrompt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  guardrailsPrompt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(AGENT_MODEL_IDS)
  model?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  temperature?: number;
}
