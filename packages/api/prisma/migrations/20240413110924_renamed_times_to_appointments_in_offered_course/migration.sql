/*
  Warnings:

  - Changed the type of `appointments` on the `OfferedCourse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OfferedCourse" DROP COLUMN "appointments",
ADD COLUMN     "appointments" JSONB NOT NULL;
