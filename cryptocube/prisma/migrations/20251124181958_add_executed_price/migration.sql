-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "executedPrice" DECIMAL(18,8);

-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "tokenValidUntil" SET DEFAULT now() + interval '1 hour';
