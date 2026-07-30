import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    StreamableFile,
  } from "@nestjs/common";
  import { Observable, map } from "rxjs";
  
  @Injectable()
  export class ResponseInterceptor<T>
    implements NestInterceptor<T, unknown>
  {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<unknown> {
      const response = context.switchToHttp().getResponse();
  
      return next.handle().pipe(
        map((data) => {
          // 204 No Content
          if (response.statusCode === 204) {
            return data;
          }
  
          // File download
          if (data instanceof StreamableFile) {
            return data;
          }
  
          return {
            success: true,
            data,
          };
        }),
      );
    }
  }