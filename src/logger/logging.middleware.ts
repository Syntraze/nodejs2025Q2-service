import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MyLogger } from './logger.service';

@Injectable()
export class Loggeriddleware implements NestMiddleware {
  constructor(private readonly logger: MyLogger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    const { method, originalUrl, body, query } = req;
    const ua = req.headers['user-agent'] || 'unknown';
    const ip = req.ip;

    res.once('finish', () => {
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000; // ms
      const status = res.statusCode;

      this.logger.log(
        `[${method}] ${originalUrl} - ${status} (${duration.toFixed(2)}ms)`,
        'Loggeriddleware',
      );

      this.logger.debug(`IP: ${ip} | UA: ${ua}`, 'Loggeriddleware');
      this.logger.debug(
        `Query: ${this.stringify(query)}`,
        'HttpLoggerMiddleware',
      );
      this.logger.debug(`Payload: ${this.stringify(body)}`, 'Loggeriddleware');
    });

    next();
  }

  private stringify(data: any): string {
    try {
      return JSON.stringify(data);
    } catch {
      return '[Invalid JSON]';
    }
  }
}
