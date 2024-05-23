-- CreateEnum
CREATE TYPE "PhaseState" AS ENUM ('NOT_STARTED', 'OPEN', 'CLOSED', 'DRAWING', 'FINISHED');

-- AlterTable
ALTER TABLE "Enrollphase" ADD COLUMN     "emailNotificationAt" TIMESTAMP(3) NOT NULL DEFAULT 'epoch',
ADD COLUMN     "state" "PhaseState" NOT NULL DEFAULT 'NOT_STARTED';
