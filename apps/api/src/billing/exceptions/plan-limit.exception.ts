import { ForbiddenException } from "@nestjs/common";

export type PlanLimitErrorBody = {
  code: "PLAN_LIMIT_REACHED";
  message: string;
};

export class PlanLimitReachedException extends ForbiddenException {
  constructor(message: string) {
    const body: PlanLimitErrorBody = {
      code: "PLAN_LIMIT_REACHED",
      message,
    };
    super(body);
  }
}
