-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderKind" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "userId" TEXT NOT NULL,
    "resetToken" TEXT NOT NULL,
    "tokenValidFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenValidUntil" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '1 hour',

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatorAccount" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "initialCashBalance" DECIMAL(18,2) NOT NULL,
    "currentCashBalance" DECIMAL(18,2) NOT NULL,
    "realizedProfitUsd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulatorAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "simulatorAccountId" INTEGER NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "amountOwned" DECIMAL(38,18) NOT NULL,
    "averageEntryPriceUsd" DECIMAL(18,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "simulatorAccountId" INTEGER NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "orderType" "TradeType" NOT NULL,
    "orderKind" "OrderKind" NOT NULL,
    "amount" DECIMAL(38,18) NOT NULL,
    "price" DECIMAL(18,8),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeHistory" (
    "id" SERIAL NOT NULL,
    "simulatorAccountId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "tradeType" "TradeType" NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "amountTraded" DECIMAL(38,18) NOT NULL,
    "tradePrice" DECIMAL(18,8) NOT NULL,
    "tradeTotal" DECIMAL(18,2) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_coinId_key" ON "WatchlistItem"("userId", "coinId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorAccount_userId_key" ON "SimulatorAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_simulatorAccountId_coinSymbol_key" ON "Portfolio"("simulatorAccountId", "coinSymbol");

-- CreateIndex
CREATE INDEX "Order_coinSymbol_idx" ON "Order"("coinSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "TradeHistory_orderId_key" ON "TradeHistory"("orderId");

-- CreateIndex
CREATE INDEX "TradeHistory_coinSymbol_idx" ON "TradeHistory"("coinSymbol");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorAccount" ADD CONSTRAINT "SimulatorAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_simulatorAccountId_fkey" FOREIGN KEY ("simulatorAccountId") REFERENCES "SimulatorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_simulatorAccountId_fkey" FOREIGN KEY ("simulatorAccountId") REFERENCES "SimulatorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistory" ADD CONSTRAINT "TradeHistory_simulatorAccountId_fkey" FOREIGN KEY ("simulatorAccountId") REFERENCES "SimulatorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistory" ADD CONSTRAINT "TradeHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
