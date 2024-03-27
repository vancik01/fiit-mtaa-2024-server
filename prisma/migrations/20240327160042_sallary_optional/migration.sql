/*
  Warnings:

  - Changed the type of `sallaryAmount` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "sallaryAmount",
ADD COLUMN     "sallaryAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "sallaryProductName" DROP NOT NULL;
