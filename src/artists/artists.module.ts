import { Module } from '@nestjs/common';
import { ArtistService } from './artists.service';
import { ArtistController } from './artists.controller';

@Module({
  controllers: [ArtistController],
  providers: [ArtistService],
  exports: [ArtistService],
})
export class ArtistsModule {}
