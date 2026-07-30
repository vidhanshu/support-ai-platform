import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

export function Authenticated() {
    return applyDecorators(UseGuards(JwtAuthGuard))
}