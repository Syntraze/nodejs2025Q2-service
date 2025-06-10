import { Module } from '@nestjs/common';
import { TrackService } from './tracks.service';
import { TrackController } from './tracks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrackController],
  providers: [TrackService],
  exports: [TrackService],
})
export class TracksModule {}
