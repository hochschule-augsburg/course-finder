/*
  Warnings:

  - You are about to drop the column `times` on the `OfferedCourse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OfferedCourse" DROP COLUMN "times",
ADD COLUMN     "appointments" JSONB[];
