/*
  Warnings:

  - You are about to drop the `OfferedCourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OfferedCourses" DROP CONSTRAINT "OfferedCourses_moduleCode_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourses" DROP CONSTRAINT "OfferedCourses_phaseId_fkey";

-- DropForeignKey
ALTER TABLE "StudentChoice" DROP CONSTRAINT "StudentChoice_offeredCourseId_fkey";

-- DropTable
DROP TABLE "OfferedCourses";

-- CreateTable
CREATE TABLE "OfferedCourse" (
    "id" SERIAL NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "minParticipants" INTEGER,
    "maxParticipants" INTEGER,
    "extraInfo" TEXT,
    "times" JSONB NOT NULL,

    CONSTRAINT "OfferedCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfferedCourse_moduleCode_key" ON "OfferedCourse"("moduleCode");

-- CreateIndex
CREATE UNIQUE INDEX "OfferedCourse_phaseId_moduleCode_key" ON "OfferedCourse"("phaseId", "moduleCode");

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Enrollphase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_moduleCode_fkey" FOREIGN KEY ("moduleCode") REFERENCES "Course"("moduleCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_offeredCourseId_fkey" FOREIGN KEY ("offeredCourseId") REFERENCES "OfferedCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
