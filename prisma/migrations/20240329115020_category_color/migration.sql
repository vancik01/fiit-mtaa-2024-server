-- CreateEnum
CREATE TYPE "ColorVariant" AS ENUM ('CHERRY', 'LEMON', 'LIME', 'APPLE', 'ORANGE');

-- AlterTable
ALTER TABLE "EventCategory" ADD COLUMN     "colorVariant" "ColorVariant" NOT NULL DEFAULT 'LIME';
