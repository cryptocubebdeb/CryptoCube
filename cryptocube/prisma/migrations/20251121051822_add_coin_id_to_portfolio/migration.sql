/*
  Warnings:

  - Made the column `coinId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `coinId` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "coinId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "tokenValidUntil" SET DEFAULT now() + interval '1 hour';

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "coinId" TEXT NOT NULL;
