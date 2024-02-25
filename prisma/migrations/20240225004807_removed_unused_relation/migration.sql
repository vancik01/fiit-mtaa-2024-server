/*
  Warnings:

  - You are about to drop the column `eventId` on the `EventCategory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventCategory" DROP CONSTRAINT "EventCategory_eventId_fkey";

-- AlterTable
ALTER TABLE "EventCategory" DROP COLUMN "eventId";
