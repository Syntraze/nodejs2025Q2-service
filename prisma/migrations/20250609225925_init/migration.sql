/*
  Warnings:

  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the `_FavoriteAlbums` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FavoriteArtists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FavoriteTracks` table. If the table is not empty, all the data it contains will be lost.
  - The required column `favoriteId` was added to the `Favorite` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteAlbums" DROP CONSTRAINT "_FavoriteAlbums_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteAlbums" DROP CONSTRAINT "_FavoriteAlbums_B_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteArtists" DROP CONSTRAINT "_FavoriteArtists_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteArtists" DROP CONSTRAINT "_FavoriteArtists_B_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteTracks" DROP CONSTRAINT "_FavoriteTracks_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteTracks" DROP CONSTRAINT "_FavoriteTracks_B_fkey";

-- DropIndex
DROP INDEX "Favorite_userId_key";

-- AlterTable
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "albums" TEXT[],
ADD COLUMN     "artists" TEXT[],
ADD COLUMN     "favoriteId" TEXT NOT NULL,
ADD COLUMN     "tracks" TEXT[],
ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY ("favoriteId");

-- DropTable
DROP TABLE "_FavoriteAlbums";

-- DropTable
DROP TABLE "_FavoriteArtists";

-- DropTable
DROP TABLE "_FavoriteTracks";
