import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favs')
export class FavoritesController {
  constructor(private readonly favsService: FavoritesService) {}

  @Get()
  getAll() {
    return this.favsService.getAll();
  }

  @Post('track/:id')
  addTrack(@Param('id') id: string) {
    return this.favsService.addTrackToFavorites(id);
  }

  @Delete('track/:id')
  removeTrack(@Param('id') id: string) {
    return this.favsService.removeTrackFromFavorites(id);
  }

  @Post('album/:id')
  addAlbum(@Param('id') id: string) {
    return this.favsService.addAlbumToFavorites(id);
  }

  @Delete('album/:id')
  removeAlbum(@Param('id') id: string) {
    return this.favsService.removeAlbumFromFavorites(id);
  }

  @Post('artist/:id')
  addArtist(@Param('id') id: string) {
    return this.favsService.addArtistToFavorites(id);
  }

  @Delete('artist/:id')
  removeArtist(@Param('id') id: string) {
    return this.favsService.removeArtistFromFavorites(id);
  }
}
