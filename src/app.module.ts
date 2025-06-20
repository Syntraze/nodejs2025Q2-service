import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ArtistsModule } from './artists/artists.module';

import { TracksModule } from './tracks/tracks.module';
import { AlbumsModule } from './albums/albums.module';
import { FavoritesModule } from './favorites/favorites.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { LoggerModule } from './logger/logger.module';
import { Loggeriddleware } from './logger/logging.middleware';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistsModule,
    TracksModule,
    AlbumsModule,
    FavoritesModule,
    UsersModule,
    PrismaModule,
    AuthModule,
    LoggerModule,
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Loggeriddleware).forRoutes('*');
  }
}