import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.album.findMany();
  }

  async findOne(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');

    return album;
  }

  async create(dto: CreateAlbumDto) {
    if (dto.artistId && !isUUID(dto.artistId)) {
      throw new BadRequestException('Invalid artistId');
    }

    if (dto.artistId) {
      const artistExists = await this.prisma.artist.findUnique({
        where: { id: dto.artistId },
      });
      if (!artistExists) throw new NotFoundException('Artist not found');
    }

    return this.prisma.album.create({ data: dto });
  }

  async update(id: string, dto: UpdateAlbumDto) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');

    if (dto.artistId && !isUUID(dto.artistId)) {
      throw new BadRequestException('Invalid artistId');
    }

    if (dto.artistId) {
      const artistExists = await this.prisma.artist.findUnique({
        where: { id: dto.artistId },
      });
      if (!artistExists) throw new NotFoundException('Artist not found');
    }

    return this.prisma.album.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Album not found');

    await this.prisma.album.delete({ where: { id } });
  }

  async nullifyArtistReferences(artistId: string) {
    await this.prisma.album.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }
}
