/*
  Warnings:

  - The primary key for the `Prof` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Prof` table. All the data in the column will be lost.
  - You are about to drop the column `facultyName` on the `Prof` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Prof` table. All the data in the column will be lost.
  - You are about to drop the column `twoFA` on the `Prof` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `birthDate` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `facultyName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `twoFA` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prof" DROP CONSTRAINT "Prof_facultyName_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_facultyName_fkey";

-- DropForeignKey
ALTER TABLE "StudentChoice" DROP CONSTRAINT "StudentChoice_studentId_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToProf" DROP CONSTRAINT "_CourseToProf_B_fkey";

-- AlterTable
ALTER TABLE "Prof" DROP CONSTRAINT "Prof_pkey",
DROP COLUMN "email",
DROP COLUMN "facultyName",
DROP COLUMN "name",
DROP COLUMN "twoFA",
ADD CONSTRAINT "Prof_pkey" PRIMARY KEY ("username");

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "birthDate",
DROP COLUMN "email",
DROP COLUMN "facultyName",
DROP COLUMN "name",
DROP COLUMN "twoFA",
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("username");

-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "auth" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "facultyName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prof" ADD CONSTRAINT "Prof_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToProf" ADD CONSTRAINT "_CourseToProf_B_fkey" FOREIGN KEY ("B") REFERENCES "Prof"("username") ON DELETE CASCADE ON UPDATE CASCADE;
