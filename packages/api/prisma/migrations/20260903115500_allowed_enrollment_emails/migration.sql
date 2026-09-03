-- AlterTable
ALTER TABLE "AppConf" ADD COLUMN     "allowedEnrollmentEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];

