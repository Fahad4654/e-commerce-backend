/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('processing', 'delivered', 'completed');

-- AlterTable
ALTER TABLE "public"."Cart" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'processing';

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "createdAt",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "isAdmin",
DROP COLUMN "phone",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX "User_refreshToken_key" ON "public"."User"("refreshToken");
