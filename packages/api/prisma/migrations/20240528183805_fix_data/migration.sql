-- AlterTable
ALTER TABLE "Enrollphase" ALTER COLUMN "emailNotificationAt" SET DEFAULT (NOW() - '30 days'::interval);
