-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "tokenValidUntil" SET DEFAULT now() + interval '1 hour';

-- CreateTable
CREATE TABLE "PortfolioHistory" (
    "id" SERIAL NOT NULL,
    "simulatorAccountId" INTEGER NOT NULL,
    "totalValueUsd" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioHistory_simulatorAccountId_idx" ON "PortfolioHistory"("simulatorAccountId");

-- AddForeignKey
ALTER TABLE "PortfolioHistory" ADD CONSTRAINT "PortfolioHistory_simulatorAccountId_fkey" FOREIGN KEY ("simulatorAccountId") REFERENCES "SimulatorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
