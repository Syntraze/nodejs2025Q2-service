import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './logger/exception.filter';
import { MyLogger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  const logger = app.get(MyLogger);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 4000;

  await app.listen(port);
}
bootstrap();
