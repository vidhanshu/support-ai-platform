import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { SubscriptionPlan, WorkspaceRole } from "@repo/database";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtUser } from "../auth/interfaces/jwt.interface";
import { RequireWorkspace } from "../common/decorators/workspace-protected.decorator";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorate";
import type { WorkspaceContext } from "../common/interfaces/request.interface";
import { CurrentWorkspace } from "../workspace/decorators/current-workspace.decorator";
import { BillingService } from "./billing.service";
import { ChangePlanDto } from "./dto/change-plan.dto";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";

@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @RequireWorkspace()
  getBilling(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.billingService.getBillingStatus(workspace);
  }

  @Post("checkout")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  checkout(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(
      workspace,
      user,
      dto.plan,
    );
  }

  @Post("change-plan")
  @RequireWorkspace()
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  changePlan(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @CurrentUser() user: JwtUser,
    @Body() dto: ChangePlanDto,
  ) {
    return this.billingService.changePlan(
      workspace,
      user,
      dto.plan as SubscriptionPlan,
    );
  }

  /**
   * Stripe webhook — no JWT. Requires raw body for signature verification.
   * Local: `stripe listen --forward-to localhost:3001/v1/billing/webhook`
   */
  @Post("webhook")
  @HttpCode(200)
  webhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string | undefined,
  ) {
    const rawBody = (req as RawBodyRequest<Request>).rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        "Raw body missing — ensure NestFactory.create(..., { rawBody: true })",
      );
    }
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
