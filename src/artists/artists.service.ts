import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) throw new NotFoundException('Artist not found');

    return artist;
  }

  async create(dto: CreateArtistDto) {
    return this.prisma.artist.create({ data: dto });
  }

  async update(id: string, dto: UpdateArtistDto) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const existing = await this.prisma.artist.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Artist not found');

    return this.prisma.artist.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const existing = await this.prisma.artist.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Artist not found');

    await this.prisma.artist.delete({ where: { id } });
  }

  async nullifyArtistReferences(id: string) {

    await this.prisma.album.updateMany({
      where: { artistId: id },
      data: { artistId: null },
    });

    await this.prisma.track.updateMany({
      where: { artistId: id },
      data: { artistId: null },
    });
  }
}
