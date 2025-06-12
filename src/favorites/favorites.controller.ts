import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favs')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async findAll(): Promise<any> {
    return this.favoritesService.findAll();
  }

  @Post(':type/:id')
  async create(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('type') type: 'artist' | 'album' | 'track',
  ): Promise<any> {
    return this.favoritesService.create(id, type);
  }

  @Delete(':type/:id')
  @HttpCode(204)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('type') type: 'artist' | 'album' | 'track',
  ): Promise<void> {
    await this.favoritesService.removeType(id, type);
  }
}
