import { Module } from '@nestjs/common';
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
  ],
  providers: [PrismaService, ],
})
export class AppModule {}
