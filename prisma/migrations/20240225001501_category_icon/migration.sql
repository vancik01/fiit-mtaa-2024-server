/*
  Warnings:

  - Added the required column `icon` to the `EventCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventCategory" ADD COLUMN     "icon" TEXT NOT NULL;
