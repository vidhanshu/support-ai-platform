import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import Stripe from "stripe";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal Server Error";
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const error = exception.getResponse();

      if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object") {
        const body = error as {
          message?: string | string[];
          code?: string;
        };
        message = body.message ?? message;
        code = body.code;
      }
      // TooManyRequestsException often nests message in the body object
      if (
        Array.isArray(message) === false &&
        typeof message === "object" &&
        message &&
        "message" in message
      ) {
        const nested = (message as { message?: string | string[] }).message;
        if (nested) message = nested;
      }
    } else if (exception instanceof Stripe.errors.StripeError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
      this.logger.error(
        `Stripe error on ${request.method} ${request.url}: ${exception.message}`,
      );
    } else {
      const detail =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        `Unhandled error on ${request.method} ${request.url}: ${detail}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message,
        ...(code ? { code } : {}),
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
