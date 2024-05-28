-- DropForeignKey
ALTER TABLE "OfferedCourse" DROP CONSTRAINT "OfferedCourse_moduleCode_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourse" DROP CONSTRAINT "OfferedCourse_phaseId_fkey";

-- DropForeignKey
ALTER TABLE "PhaseAssignment" DROP CONSTRAINT "PhaseAssignment_username_phaseId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_facultyName_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_username_fkey";

-- DropForeignKey
ALTER TABLE "StudentPhase" DROP CONSTRAINT "StudentPhase_phaseId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPhase" DROP CONSTRAINT "StudentPhase_username_fkey";

-- AlterTable
ALTER TABLE "Enrollphase" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "emailNotificationAt" SET DEFAULT 'epoch';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_facultyName_fkey" FOREIGN KEY ("facultyName") REFERENCES "Faculty"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Enrollphase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_moduleCode_fkey" FOREIGN KEY ("moduleCode") REFERENCES "Course"("moduleCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPhase" ADD CONSTRAINT "StudentPhase_username_fkey" FOREIGN KEY ("username") REFERENCES "Student"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPhase" ADD CONSTRAINT "StudentPhase_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Enrollphase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseAssignment" ADD CONSTRAINT "PhaseAssignment_username_phaseId_fkey" FOREIGN KEY ("username", "phaseId") REFERENCES "StudentPhase"("username", "phaseId") ON DELETE CASCADE ON UPDATE CASCADE;
