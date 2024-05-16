-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "auth" JSONB NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "Student" (
    "username" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "term" INTEGER,
    "regNumber" TEXT,
    "facultyName" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("username")
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
    "editorUsername" TEXT,
    "lecturers" TEXT[],
    "facultyName" TEXT,
    "semesterHours" INTEGER NOT NULL,
    "creditPoints" INTEGER NOT NULL,
    "varyingCP" JSONB,
    "infoUrl" TEXT,
    "pdf" BYTEA,
    "extraInfo" TEXT,

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
CREATE TABLE "OfferedCourse" (
    "phaseId" INTEGER NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "minParticipants" INTEGER NOT NULL DEFAULT 0,
    "maxParticipants" INTEGER,
    "extraInfo" TEXT,
    "moodleCourse" TEXT,
    "for" TEXT[],
    "appointments" JSONB NOT NULL,

    CONSTRAINT "OfferedCourse_pkey" PRIMARY KEY ("phaseId","moduleCode")
);

-- CreateTable
CREATE TABLE "StudentPhase" (
    "username" TEXT NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "creditsNeeded" INTEGER NOT NULL,

    CONSTRAINT "StudentPhase_pkey" PRIMARY KEY ("username","phaseId")
);

-- CreateTable
CREATE TABLE "StudentChoice" (
    "moduleCode" TEXT NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "StudentChoice_pkey" PRIMARY KEY ("moduleCode","username","phaseId")
);

-- CreateTable
CREATE TABLE "PhaseAssignment" (
    "id" SERIAL NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "moduleCode" TEXT NOT NULL,

    CONSTRAINT "PhaseAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_editorUsername_fkey" FOREIGN KEY ("editorUsername") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Enrollphase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_moduleCode_fkey" FOREIGN KEY ("moduleCode") REFERENCES "Course"("moduleCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPhase" ADD CONSTRAINT "StudentPhase_username_fkey" FOREIGN KEY ("username") REFERENCES "Student"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPhase" ADD CONSTRAINT "StudentPhase_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Enrollphase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_moduleCode_phaseId_fkey" FOREIGN KEY ("moduleCode", "phaseId") REFERENCES "OfferedCourse"("moduleCode", "phaseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_username_phaseId_fkey" FOREIGN KEY ("username", "phaseId") REFERENCES "StudentPhase"("username", "phaseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseAssignment" ADD CONSTRAINT "PhaseAssignment_username_phaseId_fkey" FOREIGN KEY ("username", "phaseId") REFERENCES "StudentPhase"("username", "phaseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseAssignment" ADD CONSTRAINT "PhaseAssignment_phaseId_moduleCode_fkey" FOREIGN KEY ("phaseId", "moduleCode") REFERENCES "OfferedCourse"("phaseId", "moduleCode") ON DELETE RESTRICT ON UPDATE CASCADE;
