import { Module } from '@nestjs/common';
import { ArtistService } from './artists.service';
import { ArtistController } from './artists.controller';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArtistController],
  providers: [ArtistService],
  exports: [ArtistService],
})
export class ArtistsModule {}
