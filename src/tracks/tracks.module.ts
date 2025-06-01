import { Module, forwardRef } from '@nestjs/common';
import { TrackService } from './tracks.service';
import { TrackController } from './tracks.controller';
import { FavoritesModule } from 'src/favorites/favorites.module'; // ✅

@Module({
  imports: [forwardRef(() => FavoritesModule)],
  controllers: [TrackController],
  providers: [TrackService],
  exports: [TrackService],
})
export class TracksModule {}
