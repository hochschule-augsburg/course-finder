/*
  Warnings:

  - Made the column `minParticipants` on table `OfferedCourse` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `creditsNeeded` to the `StudentPhase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OfferedCourse" ALTER COLUMN "minParticipants" SET NOT NULL,
ALTER COLUMN "minParticipants" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "StudentPhase" ADD COLUMN     "creditsNeeded" INTEGER NOT NULL DEFAULT 0;
