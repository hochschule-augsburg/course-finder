-- CreateEnum
CREATE TYPE "Singleton" AS ENUM ('Instance');

-- CreateTable
CREATE TABLE "AppConf" (
    "id" "Singleton" NOT NULL DEFAULT 'Instance',
    "maxCredits" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "AppConf_pkey" PRIMARY KEY ("id")
);
