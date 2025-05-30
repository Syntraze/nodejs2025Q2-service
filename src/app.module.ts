import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistsModule } from './artists/artists.module';
import { TracksResolver } from './tracks/tracks.resolver';
import { TracksModule } from './tracks/tracks.module';
import { AlbumsModule } from './albums/albums.module';
import { FavoritesModule } from './favorites/favorites.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ArtistsModule, TracksModule, AlbumsModule, FavoritesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, TracksResolver],
})
export class AppModule {}
