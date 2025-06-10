import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { Track } from './entities/track.entity';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Track[]> {
    return this.prisma.track.findMany();
  }

  async findOne(id: string): Promise<Track> {
    return this.findTrackOrThrow(id);
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    return this.prisma.track.create({ data: createTrackDto });
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    await this.findTrackOrThrow(id);
    return this.prisma.track.update({
      where: { id },
      data: updateTrackDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findTrackOrThrow(id);
    await this.prisma.track.delete({ where: { id } });
  }

  private async findTrackOrThrow(id: string): Promise<Track> {
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }
}
