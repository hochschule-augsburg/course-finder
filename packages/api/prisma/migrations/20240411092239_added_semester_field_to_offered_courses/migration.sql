/*
  Warnings:

  - Added the required column `semester` to the `OfferedCourses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OfferedCourses" ADD COLUMN     "semester" TEXT NOT NULL;
