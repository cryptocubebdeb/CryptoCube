-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "tokenValidUntil" SET DEFAULT now() + interval '1 hour';
