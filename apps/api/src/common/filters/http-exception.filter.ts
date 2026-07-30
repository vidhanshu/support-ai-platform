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
    let message = "Internal Server Error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const error = exception.getResponse();

      message =
        typeof error === "string"
          ? error
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any).message ?? message);
    }

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message,
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
