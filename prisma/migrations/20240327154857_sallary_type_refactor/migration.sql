/*
  Warnings:

  - You are about to drop the column `sallary` on the `Event` table. All the data in the column will be lost.
  - Added the required column `sallaryAmount` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sallaryProductName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sallaryUnit` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "sallary",
ADD COLUMN     "sallaryAmount" TEXT NOT NULL,
ADD COLUMN     "sallaryProductName" TEXT NOT NULL,
ADD COLUMN     "sallaryUnit" TEXT NOT NULL;
