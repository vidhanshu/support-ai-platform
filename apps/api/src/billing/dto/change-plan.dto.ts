import { IsIn } from "class-validator";

export class ChangePlanDto {
  @IsIn(["FREE", "HOBBY", "PRO"])
  plan: "FREE" | "HOBBY" | "PRO";
}
