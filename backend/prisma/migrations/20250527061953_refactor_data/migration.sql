/*
  Warnings:

  - You are about to drop the column `Score` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Streak` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Score",
DROP COLUMN "Streak",
ADD COLUMN     "score" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;
