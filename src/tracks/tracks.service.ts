import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { validate as isUUID } from 'uuid';
import { FavoritesService } from 'src/favorites/favorites.service';

@Injectable()
export class TrackService {
  private tracks: Track[] = [];

  constructor(private readonly favoritesService: FavoritesService) {}

  findAll(): Track[] {
    return this.tracks;
  }

  findOne(id: string): Track {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const track = this.tracks.find((t) => t.id === id);
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  create(dto: CreateTrackDto): Track {
    const track = new Track(
      dto.name,
      dto.artistId ?? null,
      dto.albumId ?? null,
      dto.duration,
    );
    this.tracks.push(track);
    return track;
  }

  update(id: string, dto: UpdateTrackDto): Track {
    const track = this.findOne(id);
    if (dto.name !== undefined) track.name = dto.name;
    if (dto.artistId !== undefined) track.artistId = dto.artistId;
    if (dto.albumId !== undefined) track.albumId = dto.albumId;
    if (dto.duration !== undefined) track.duration = dto.duration;
    return track;
  }

  remove(id: string): void {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const index = this.tracks.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException('Track not found');

    // Clean up references
    this.favoritesService.handleEntityDeletion('track', id);

    this.tracks.splice(index, 1);
  }

  nullifyArtistReferences(artistId: string): void {
    this.tracks.forEach((track) => {
      if (track.artistId === artistId) {
        track.artistId = null;
      }
    });
  }

  nullifyAlbumReferences(albumId: string): void {
    this.tracks.forEach((track) => {
      if (track.albumId === albumId) {
        track.albumId = null;
      }
    });
  }
}
