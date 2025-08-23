-- AlterTable
ALTER TABLE "public"."AppConf" ADD COLUMN     "hasMinFocuses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moduleBookLastUpdated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "minFocus" JSONB;
