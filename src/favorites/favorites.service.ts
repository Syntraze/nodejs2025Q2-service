
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validate as isUUID } from 'uuid';

import { Artist } from 'src/artists/entities/artist.entity';
import { Album } from 'src/albums/entities/album.entity';
import { Track } from 'src/tracks/entities/track.entity';
import { ArtistService } from 'src/artists/artists.service';
import { AlbumService } from 'src/albums/albums.service';
import { TrackService } from 'src/tracks/tracks.service';

@Injectable()
export class FavoritesService {
  private favoriteArtists = new Set<string>();
  private favoriteAlbums = new Set<string>();
  private favoriteTracks = new Set<string>();

  constructor(
    private readonly artistService: ArtistService,
    private readonly albumService: AlbumService,
    private readonly trackService: TrackService,
  ) {}

  getAll(): {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
  } {
    return {
      artists: Array.from(this.favoriteArtists).map((id) =>
        this.artistService.findOne(id),
      ),
      albums: Array.from(this.favoriteAlbums).map((id) =>
        this.albumService.findOne(id),
      ),
      tracks: Array.from(this.favoriteTracks).map((id) =>
        this.trackService.findOne(id),
      ),
    };
  }

  private validateAndAdd(entityType: 'artist' | 'album' | 'track', id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    let exists = false;

    switch (entityType) {
      case 'artist':
        exists = !!this.artistService.findOne(id);
        if (!exists)
          throw new UnprocessableEntityException('Artist does not exist');
        this.favoriteArtists.add(id);
        break;
      case 'album':
        exists = !!this.albumService.findOne(id);
        if (!exists)
          throw new UnprocessableEntityException('Album does not exist');
        this.favoriteAlbums.add(id);
        break;
      case 'track':
        exists = !!this.trackService.findOne(id);
        if (!exists)
          throw new UnprocessableEntityException('Track does not exist');
        this.favoriteTracks.add(id);
        break;
    }
  }

  addArtistToFavorites(id: string) {
    this.validateAndAdd('artist', id);
    return { message: 'Artist added to favorites' };
  }

  addAlbumToFavorites(id: string) {
    this.validateAndAdd('album', id);
    return { message: 'Album added to favorites' };
  }

  addTrackToFavorites(id: string) {
    this.validateAndAdd('track', id);
    return { message: 'Track added to favorites' };
  }

  removeArtistFromFavorites(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const deleted = this.favoriteArtists.delete(id);
    if (!deleted) throw new NotFoundException('Artist not in favorites');
  }

  removeAlbumFromFavorites(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const deleted = this.favoriteAlbums.delete(id);
    if (!deleted) throw new NotFoundException('Album not in favorites');
  }

  removeTrackFromFavorites(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const deleted = this.favoriteTracks.delete(id);
    if (!deleted) throw new NotFoundException('Track not in favorites');
  }

  handleEntityDeletion(entityType: 'artist' | 'album' | 'track', id: string) {
    switch (entityType) {
      case 'artist':
        this.favoriteArtists.delete(id);
        this.albumService.nullifyArtistReferences(id);
        this.trackService.nullifyArtistReferences(id);
        break;
      case 'album':
        this.favoriteAlbums.delete(id);
        this.trackService.nullifyAlbumReferences(id);
        break;
      case 'track':
        this.favoriteTracks.delete(id);
        break;
    }
  }
}
