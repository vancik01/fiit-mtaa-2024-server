/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "EventAssignment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
