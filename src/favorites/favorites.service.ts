import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
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
    @Inject(forwardRef(() => ArtistService))
    private readonly artistService: ArtistService,

    @Inject(forwardRef(() => AlbumService))
    private readonly albumService: AlbumService,

    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
  ) {}

  async getAll(): Promise<{
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
  }> {
    const artists = await Promise.all(
      Array.from(this.favoriteArtists).map((id) =>
        this.artistService.findOne(id),
      ),
    );
    const albums = await Promise.all(
      Array.from(this.favoriteAlbums).map((id) =>
        this.albumService.findOne(id),
      ),
    );
    const tracks = await Promise.all(
      Array.from(this.favoriteTracks).map((id) =>
        this.trackService.findOne(id),
      ),
    );

    return { artists, albums, tracks };
  }

  private async validateAndAdd(
    entityType: 'artist' | 'album' | 'track',
    id: string,
  ): Promise<void> {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    try {
      switch (entityType) {
        case 'artist':
          await this.artistService.findOne(id);
          this.favoriteArtists.add(id);
          break;
        case 'album':
          await this.albumService.findOne(id);
          this.favoriteAlbums.add(id);
          break;
        case 'track':
          await this.trackService.findOne(id);
          this.favoriteTracks.add(id);
          break;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(`${entityType} does not exist`);
      }
      throw error; 
    }
  }

  async addArtistToFavorites(id: string) {
    await this.validateAndAdd('artist', id);
    return { message: 'Artist added to favorites' };
  }

  async addAlbumToFavorites(id: string) {
    await this.validateAndAdd('album', id);
    return { message: 'Album added to favorites' };
  }

  async addTrackToFavorites(id: string) {
    await this.validateAndAdd('track', id);
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
