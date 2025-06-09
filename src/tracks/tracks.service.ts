import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.track.findMany();
  }

  async findOne(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');

    return track;
  }

  async create(dto: CreateTrackDto) {
    return this.prisma.track.create({ data: dto });
  }

  async update(id: string, dto: UpdateTrackDto) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');

    return this.prisma.track.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid UUID');

    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');

    await this.prisma.track.delete({ where: { id } });
  }

  async nullifyArtistReferences(artistId: string) {
    await this.prisma.track.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }

  async nullifyAlbumReferences(albumId: string) {
    await this.prisma.track.updateMany({
      where: { albumId },
      data: { albumId: null },
    });
  }
}
