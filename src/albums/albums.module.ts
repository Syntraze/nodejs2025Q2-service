import { Module } from '@nestjs/common';
import { AlbumService } from './albums.service';
import { AlbumController } from './albums.controller';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService],
})
export class AlbumsModule {}
