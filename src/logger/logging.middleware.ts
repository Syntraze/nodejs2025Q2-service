import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MyLogger } from './logger.service';

@Injectable()
export class Loggeriddleware implements NestMiddleware {
  private readonly context = Loggeriddleware.name;

  constructor(private readonly logger: MyLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query = {}, body = {} } = req;
    const userAgent = req.get('user-agent') ?? '';
    const clientIp = req.ip;
    const startTs = Date.now();

    res.once('finish', () => {
      const { statusCode } = res;
      const durationMs = Date.now() - startTs;

      const baseMsg = `${method} ${originalUrl} ${statusCode} ${durationMs}ms`;
      this.logger.log(
        `${baseMsg} — UA: ${userAgent} — IP: ${clientIp}`,
        this.context,
      );

      this.logger.debug(`Query: ${this.safeStringify(query)}`, this.context);
      this.logger.debug(`Body: ${this.safeStringify(body)}`, this.context);
    });

    next();
  }

  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return '[Unable to stringify]';
    }
  }
}
