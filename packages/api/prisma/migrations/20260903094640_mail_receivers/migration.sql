-- AlterTable
ALTER TABLE "AppConf" ADD COLUMN     "mailReceivers" TEXT[] DEFAULT ARRAY[]::TEXT[];
