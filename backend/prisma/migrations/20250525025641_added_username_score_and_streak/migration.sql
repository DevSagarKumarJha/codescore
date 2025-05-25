/*
  Warnings:

  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Score" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "Streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "username" TEXT NOT NULL;
