import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './entities/artist.entity';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Artist[]> {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.findArtistOrThrow(id);
    return this.transformToArtistEntity(artist);
  }

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const artist = await this.prisma.artist.create({ data: createArtistDto });
    return this.transformToArtistEntity(artist);
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    await this.findArtistOrThrow(id);
    const updatedArtist = await this.prisma.artist.update({
      where: { id },
      data: updateArtistDto,
    });
    return this.transformToArtistEntity(updatedArtist);
  }

  async remove(id: string): Promise<void> {
    await this.findArtistOrThrow(id);
    await this.prisma.artist.delete({ where: { id } });
  }

  private transformToArtistEntity = (data: unknown): Artist => {
    return plainToClass(Artist, data);
  };

  private async findArtistOrThrow(id: string): Promise<Artist> {
    const artist = await this.prisma.artist.findUnique({ where: { id } });
    if (!artist) throw new NotFoundException(`Artist with ID ${id} not found`);
    return artist;
  }
}
