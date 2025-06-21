import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Album[]> {
    const albums = await this.prisma.album.findMany();
    return albums.map(this.transformToAlbumEntity);
  }

  async findOne(id: string): Promise<Album> {
    const album = await this.findAlbumOrThrow(id);
    return this.transformToAlbumEntity(album);
  }

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const album = await this.prisma.album.create({ data: createAlbumDto });
    return this.transformToAlbumEntity(album);
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    await this.findAlbumOrThrow(id);
    const updatedAlbum = await this.prisma.album.update({
      where: { id },
      data: updateAlbumDto,
    });
    return this.transformToAlbumEntity(updatedAlbum);
  }

  async remove(id: string): Promise<void> {
    await this.findAlbumOrThrow(id);
    await this.prisma.album.delete({ where: { id } });
  }

  private transformToAlbumEntity = (data: unknown): Album => {
    return plainToClass(Album, data);
  };

  private async findAlbumOrThrow(id: string): Promise<Album> {
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException(`Album with ID ${id} not found`);
    return album;
  }
}
