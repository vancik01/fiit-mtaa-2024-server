/*
  Warnings:

  - The values [Active,SignedOff] on the enum `EventAssignmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventAssignmentStatus_new" AS ENUM ('ACTIVE', 'SIGNED_OFF');
ALTER TABLE "EventAssignment" ALTER COLUMN "assignmentStatus" DROP DEFAULT;
ALTER TABLE "EventAssignment" ALTER COLUMN "assignmentStatus" TYPE "EventAssignmentStatus_new" USING ("assignmentStatus"::text::"EventAssignmentStatus_new");
ALTER TYPE "EventAssignmentStatus" RENAME TO "EventAssignmentStatus_old";
ALTER TYPE "EventAssignmentStatus_new" RENAME TO "EventAssignmentStatus";
DROP TYPE "EventAssignmentStatus_old";
ALTER TABLE "EventAssignment" ALTER COLUMN "assignmentStatus" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "EventAssignment" ALTER COLUMN "assignmentStatus" SET DEFAULT 'ACTIVE';
