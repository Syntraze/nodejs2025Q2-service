import { Module } from '@nestjs/common';
import { ArtistService } from './artists.service';
import { ArtistController } from './artists.controller';
import { AlbumsModule } from 'src/albums/albums.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { TracksModule } from 'src/tracks/tracks.module';
@Module({
  imports: [TracksModule, AlbumsModule, FavoritesModule],
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}