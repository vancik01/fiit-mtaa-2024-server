/*
  Warnings:

  - The values [USER] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `sallary` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('WORKER', 'COMPANY');
ALTER TABLE "User" ALTER COLUMN "type" TYPE "AccountType_new" USING ("type"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "AccountType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sallary" TEXT NOT NULL;
