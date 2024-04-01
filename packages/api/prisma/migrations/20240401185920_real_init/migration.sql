/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Student" (
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "term" INTEGER,
    "regNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "twoFA" JSONB,
    "facultyName" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Prof" (
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "telephone" TEXT,
    "office" TEXT,
    "twoFA" JSONB,
    "facultyName" TEXT NOT NULL,

    CONSTRAINT "Prof_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "name" TEXT NOT NULL,
    "translatedName" JSONB NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Course" (
    "moduleCode" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "examinationNumbers" TEXT[],
    "lecturerNames" TEXT[],
    "requirements" TEXT[],
    "language" TEXT NOT NULL,
    "facultyName" TEXT,
    "semesterHours" INTEGER NOT NULL,
    "creditPoints" INTEGER NOT NULL,
    "timeDistribution" TEXT,
    "examType" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "learningGoals" JSONB NOT NULL,
    "literature" TEXT[],
    "moodleCourse" TEXT,
    "website" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("moduleCode")
);

-- CreateTable
CREATE TABLE "Enrollphase" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,

    CONSTRAINT "Enrollphase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferedCourses" (
    "id" SERIAL NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "extraInfo" TEXT,
    "times" JSONB NOT NULL,

    CONSTRAINT "OfferedCourses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentChoice" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "offeredCourseId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "lastChange" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToProf" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OfferedCourses_phaseId_moduleCode_key" ON "OfferedCourses"("phaseId", "moduleCode");

-- CreateIndex
CREATE UNIQUE INDEX "StudentChoice_studentId_offeredCourseId_key" ON "StudentChoice"("studentId", "offeredCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToProf_AB_unique" ON "_CourseToProf"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToProf_B_index" ON "_CourseToProf"("B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prof" ADD CONSTRAINT "Prof_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourses" ADD CONSTRAINT "OfferedCourses_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Enrollphase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourses" ADD CONSTRAINT "OfferedCourses_moduleCode_fkey" FOREIGN KEY ("moduleCode") REFERENCES "Course"("moduleCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_offeredCourseId_fkey" FOREIGN KEY ("offeredCourseId") REFERENCES "OfferedCourses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToProf" ADD CONSTRAINT "_CourseToProf_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("moduleCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToProf" ADD CONSTRAINT "_CourseToProf_B_fkey" FOREIGN KEY ("B") REFERENCES "Prof"("email") ON DELETE CASCADE ON UPDATE CASCADE;
