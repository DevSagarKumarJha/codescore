-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpires" TIMESTAMP(3),
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetTokenExpires" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT;
