
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ArtistService {
  private artists: Artist[] = [];

  findAll(): Artist[] {
    return this.artists;
  }

  findOne(id: string): Artist {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  create(dto: CreateArtistDto): Artist {
    const artist = new Artist(dto.name, dto.grammy);
    this.artists.push(artist);
    return artist;
  }

  update(id: string, dto: UpdateArtistDto): Artist {
    const artist = this.findOne(id);
    if (dto.name !== undefined) artist.name = dto.name;
    if (dto.grammy !== undefined) artist.grammy = dto.grammy;
    return artist;
  }

  remove(id: string): void {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const index = this.artists.findIndex((a) => a.id === id);
    if (index === -1) throw new NotFoundException('Artist not found');
    this.artists.splice(index, 1);
  }
}
