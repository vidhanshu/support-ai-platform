import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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
