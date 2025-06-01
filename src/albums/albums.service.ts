import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class AlbumService {
  private albums: Album[] = [];

  findAll(): Album[] {
    return this.albums;
  }

  findOne(id: string): Album {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const album = this.albums.find((a) => a.id === id);
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  create(dto: CreateAlbumDto): Album {
    const album = new Album(dto.name, dto.year, dto.artistId ?? null);
    this.albums.push(album);
    return album;
  }

  update(id: string, dto: UpdateAlbumDto): Album {
    const album = this.findOne(id);
    if (dto.name !== undefined) album.name = dto.name;
    if (dto.year !== undefined) album.year = dto.year;
    if (dto.artistId !== undefined) album.artistId = dto.artistId;
    return album;
  }

  remove(id: string): void {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');
    const index = this.albums.findIndex((a) => a.id === id);
    if (index === -1) throw new NotFoundException('Album not found');
    this.albums.splice(index, 1);
  }

  nullifyArtistReferences(artistId: string) {
    this.albums.forEach((album) => {
      if (album.artistId === artistId) {
        album.artistId = null;
      }
    });
  }
}
