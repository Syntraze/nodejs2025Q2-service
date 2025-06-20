import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MyLogger } from './logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: MyLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const res = httpContext.getResponse();
    const req = httpContext.getRequest();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const errorMessage =
      typeof errorResponse === 'string'
        ? { message: errorResponse }
        : errorResponse;

    this.logger.error(
      `HTTP ${statusCode} - ${req.method} ${req.url}`,
      JSON.stringify(errorMessage),
      GlobalExceptionFilter.name,
    );

    res.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...errorMessage,
    });
  }
}
