/*
  Warnings:

  - You are about to drop the column `locationLat` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `locationLon` on the `Event` table. All the data in the column will be lost.
  - Added the required column `locationId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "locationLat",
DROP COLUMN "locationLon",
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "setupComplete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EventAssignment" ADD COLUMN     "presenceStatus" "EventPresenceStatus" NOT NULL DEFAULT 'NOT_PRESENT';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLon" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
