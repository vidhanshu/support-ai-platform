import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { PlanLimitsService } from "./plan-limits.service";
import { StripeService } from "./stripe.service";

@Module({
  controllers: [BillingController],
  providers: [BillingService, StripeService, PlanLimitsService],
  exports: [PlanLimitsService, BillingService],
})
export class BillingModule {}
