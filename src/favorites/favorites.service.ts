import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type FavoriteType = 'artist' | 'album' | 'track';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(id: string, type: FavoriteType) {
    await this.ensureEntityExists(id, type);

    const favorite = await this.prisma.favorite.findFirst();

    return favorite
      ? this.addToFavorite(favorite.favoriteId, type, id, favorite)
      : this.createInitialFavorite(type, id);
  }

  private async ensureEntityExists(id: string, type: FavoriteType) {
    const modelMap = {
      artist: this.prisma.artist,
      album: this.prisma.album,
      track: this.prisma.track,
    } as const;
    const model = modelMap[type];

    let entity: any;
    if (type === 'artist') {
      entity = await this.prisma.artist.findUnique({ where: { id } });
    } else if (type === 'album') {
      entity = await this.prisma.album.findUnique({ where: { id } });
    } else if (type === 'track') {
      entity = await this.prisma.track.findUnique({ where: { id } });
    }

    if (!entity) {
      throw new HttpException(
        `${this.capitalize(type)} with ID ${id} not found`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private addToFavorite(
    favoriteId: string,
    type: FavoriteType,
    id: string,
    favorite: any,
  ) {
    const pluralKey = `${type}s`;
    const existingList: string[] = favorite[pluralKey] ?? [];

    if (existingList.includes(id)) return favorite;

    return this.prisma.favorite.update({
      where: { favoriteId },
      data: {
        [pluralKey]: {
          set: [...existingList, id],
        },
      },
    });
  }

  private createInitialFavorite(type: FavoriteType, id: string) {
    const data = {
      artists: [],
      albums: [],
      tracks: [],
      [`${type}s`]: [id],
    };

    return this.prisma.favorite.create({ data });
  }

  async findAll() {
    const favorite = await this.prisma.favorite.findFirst();

    if (!favorite) {
      return { artists: [], albums: [], tracks: [] };
    }

    const [artists, albums, tracks] = await Promise.all([
      this.prisma.artist.findMany({
        where: { id: { in: favorite.artists ?? [] } },
      }),
      this.prisma.album.findMany({
        where: { id: { in: favorite.albums ?? [] } },
      }),
      this.prisma.track.findMany({
        where: { id: { in: favorite.tracks ?? [] } },
      }),
    ]);

    return { artists, albums, tracks };
  }

  async removeType(id: string, type: FavoriteType) {
    const favorite = await this.prisma.favorite.findFirst();
    const pluralKey = `${type}s`;
    const currentList: string[] = favorite?.[pluralKey] ?? [];

    if (!favorite || !currentList.includes(id)) {
      throw new NotFoundException(
        `${this.capitalize(type)} with ID ${id} not found in favorites`,
      );
    }

    return this.prisma.favorite.update({
      where: { favoriteId: favorite.favoriteId },
      data: {
        [pluralKey]: {
          set: currentList.filter((itemId) => itemId !== id),
        },
      },
    });
  }

  private capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
