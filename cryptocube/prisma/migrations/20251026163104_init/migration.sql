-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "tokenValidUntil" SET DEFAULT now() + interval '1 hour';
