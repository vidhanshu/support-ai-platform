import { Module } from "@nestjs/common";
import { DefaultCostCalculator } from "./cost-calculator";

@Module({
  providers: [
    {
      provide: "COST_CALCULATOR",
      useClass: DefaultCostCalculator,
    },
    DefaultCostCalculator,
  ],
  exports: ["COST_CALCULATOR", DefaultCostCalculator],
})
export class CostModule {}
