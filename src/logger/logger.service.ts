import {
  Injectable,
  LoggerService,
  OnModuleInit,
  LogLevel,
} from '@nestjs/common';
import { mkdir, stat, rename, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const LOG_LEVEL: LogLevel = (process.env.APP_LOG_LEVEL as LogLevel) || 'debug';
const LOG_FOLDER = process.env.APP_LOG_DIR || 'logs';
const MAX_SIZE_KB = parseInt(process.env.APP_MAX_FILE_SIZE_KB) || 10;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

const PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  log: 2,
  fatal: 2,
  debug: 3,
  verbose: 4,
};

const COLORS: Record<LogLevel, string> = {
  error: '\x1b[31m',
  fatal: '\x1b[35m',
  warn: '\x1b[33m',
  log: '\x1b[32m',
  debug: '\x1b[34m',
  verbose: '\x1b[36m',
};
const RESET = '\x1b[0m';

@Injectable()
export class MyLogger implements LoggerService, OnModuleInit {
  private currentLevel = PRIORITY[LOG_LEVEL];
  private logFile = join(LOG_FOLDER, 'app.log');
  private errorFile = join(LOG_FOLDER, 'errors.log');

  async onModuleInit() {
    await this.prepareLogDir();
  }

  private async prepareLogDir() {
    if (!existsSync(LOG_FOLDER)) {
      await mkdir(LOG_FOLDER, { recursive: true });
    }
  }

  private formatMessage(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ): string {
    const time = new Date().toISOString();
    const ctxStr = context ? ` [${context}]` : '';
    const traceStr = trace ? `\n${trace}` : '';
    return `[${time}] [${level.toUpperCase()}]${ctxStr} ${message}${traceStr}`;
  }

  private printToConsole(formatted: string, level: LogLevel) {
    const color = COLORS[level] || '';
    process.stdout.write(`${color}${formatted}${RESET}\n`);
  }

  private async checkRotation(path: string) {
    try {
      const stats = await stat(path);
      if (stats.size >= MAX_SIZE_BYTES) {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archive = path.replace(/\.log$/, `_${stamp}.log`);
        await rename(path, archive);
      }
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error('Rotation error:', err);
      }
    }
  }

  private async writeToFile(level: LogLevel, text: string) {
    const target =
      level === 'error' || level === 'fatal' ? this.errorFile : this.logFile;
    await this.checkRotation(target);
    await appendFile(target, text + '\n');
  }

  private async handleLog(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ) {
    if (PRIORITY[level] > this.currentLevel) return;

    const formatted = this.formatMessage(level, message, context, trace);
    this.printToConsole(formatted, level);
    await this.writeToFile(level, formatted);
  }

  log(msg: unknown, ctx?: string) {
    this.handleLog('log', msg, ctx);
  }

  error(msg: unknown, trace?: string, ctx?: string) {
    this.handleLog('error', msg, ctx, trace);
  }

  warn(msg: unknown, ctx?: string) {
    this.handleLog('warn', msg, ctx);
  }

  debug(msg: unknown, ctx?: string) {
    this.handleLog('debug', msg, ctx);
  }

  verbose(msg: unknown, ctx?: string) {
    this.handleLog('verbose', msg, ctx);
  }

  fatal(msg: unknown, ctx?: string) {
    this.handleLog('fatal', msg, ctx);
  }
}
