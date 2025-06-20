import {
  Injectable,
  LoggerService,
  OnModuleInit,
  LogLevel,
} from '@nestjs/common';
import { appendFile, mkdir, stat, rename } from 'fs/promises';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const defaultLogLevel = (process.env.APP_LOG_LEVEL as LogLevel) || 'debug';
const logDirectory = process.env.APP_LOG_DIR || 'logs';
const maxFileSizeKb = Number(process.env.APP_MAX_FILE_SIZE_KB) || 10;
const maxFileSizeBytes = maxFileSizeKb * 1024;

const levelPriority: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  log: 2,
  fatal: 2,
  debug: 3,
  verbose: 4,
};

const levelColorMap: Record<LogLevel, string> = {
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
  warn: '\x1b[33m', // Yellow
  log: '\x1b[32m', // Green
  debug: '\x1b[34m', // Blue
  verbose: '\x1b[36m', // Cyan
};
const resetColor = '\x1b[0m';

@Injectable()
export class MyLogger implements LoggerService, OnModuleInit {
  private currentPriority = levelPriority[defaultLogLevel];
  private appLogPath = join(logDirectory, 'application.log');
  private errLogPath = join(logDirectory, 'error.log');

  async onModuleInit() {
    await this.ensureLogDirectory();
  }

  private async ensureLogDirectory() {
    try {
      await stat(logDirectory);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        await mkdir(logDirectory, { recursive: true });
      }
    }
  }

  log(message: unknown, context?: string) {
    this.print('log', message, context);
  }

  fatal(message: unknown, context?: string) {
    this.print('fatal', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.print('error', message, context, trace);
  }

  warn(message: unknown, context?: string) {
    this.print('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    this.print('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    this.print('verbose', message, context);
  }

  private async print(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ) {
    if (this.currentPriority < levelPriority[level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const header = `[${timestamp}] [${level.toUpperCase()}]`;
    const ctx = context ? ` [${context}]` : '';
    const body = `${message}${trace ? `\n${trace}` : ''}`;
    const fullText = `${header}${ctx} ${body}`;
    const logEntry = fullText + '\n';

    const color = levelColorMap[level] || '';
    const coloredEntry = `${color}${fullText}${resetColor}\n`;
    process.stdout.write(coloredEntry);

    try {
      if (level === 'error' || level === 'fatal') {
        await this.rotateIfNeeded(this.errLogPath);
        await appendFile(this.errLogPath, logEntry);
      }

      await this.rotateIfNeeded(this.appLogPath);
      await appendFile(this.appLogPath, logEntry);
    } catch (err) {
      console.error('Logger failed writing to disk:', err);
    }
  }

  private async rotateIfNeeded(filePath: string) {
    try {
      const { size } = await stat(filePath);
      if (size > maxFileSizeBytes) {
        const timeSegment = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveName = filePath.replace(/\.log$/, `_${timeSegment}.log`);
        await rename(filePath, archiveName);
      }
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error('Logger rotation error:', err);
      }
    }
  }
}
