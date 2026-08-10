import { IsIn } from "class-validator";

export class CreateCheckoutSessionDto {
  @IsIn(["HOBBY", "PRO"])
  plan: "HOBBY" | "PRO";
}
