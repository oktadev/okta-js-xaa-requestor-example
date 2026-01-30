import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body } = request;
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`);
    // Don't log request body to prevent sensitive data leakage
    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Request has body with ${Object.keys(body).length} fields`);
    }

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const duration = Date.now() - startTime;
        this.logger.log(
          `Response: ${method} ${url} ${statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
