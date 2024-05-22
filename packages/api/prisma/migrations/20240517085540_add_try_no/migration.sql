/*
  Warnings:

  - The primary key for the `PhaseAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PhaseAssignment` table. All the data in the column will be lost.
  - Added the required column `tryNo` to the `PhaseAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhaseAssignment" DROP CONSTRAINT "PhaseAssignment_pkey",
DROP COLUMN "id",
ADD COLUMN     "tryNo" INTEGER NOT NULL,
ADD CONSTRAINT "PhaseAssignment_pkey" PRIMARY KEY ("phaseId", "tryNo", "username", "moduleCode");
