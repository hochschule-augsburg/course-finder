-- DropForeignKey
ALTER TABLE "StudentChoice" DROP CONSTRAINT "StudentChoice_username_phaseId_fkey";

-- AddForeignKey
ALTER TABLE "StudentChoice" ADD CONSTRAINT "StudentChoice_username_phaseId_fkey" FOREIGN KEY ("username", "phaseId") REFERENCES "StudentPhase"("username", "phaseId") ON DELETE CASCADE ON UPDATE CASCADE;
