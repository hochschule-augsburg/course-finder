/*
  Warnings:

  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `examType` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `examinationNumbers` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `learningGoals` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `literature` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `moodleCourse` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `timeDistribution` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "description",
DROP COLUMN "examType",
DROP COLUMN "examinationNumbers",
DROP COLUMN "language",
DROP COLUMN "learningGoals",
DROP COLUMN "literature",
DROP COLUMN "moodleCourse",
DROP COLUMN "requirements",
DROP COLUMN "timeDistribution",
DROP COLUMN "website",
ADD COLUMN     "extraInfo" TEXT,
ADD COLUMN     "infoUrl" TEXT,
ADD COLUMN     "pdf" BYTEA,
ADD COLUMN     "varyingCP" JSONB;

-- AlterTable
ALTER TABLE "OfferedCourse" ADD COLUMN     "for" TEXT[],
ADD COLUMN     "moodleCourse" TEXT;
