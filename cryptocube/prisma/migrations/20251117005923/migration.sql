-- DropIndex
DROP INDEX "TradeHistory_orderId_key";

-- AlterTable
ALTER TABLE "PasswordResetToken" ALTER COLUMN "tokenValidUntil" SET DEFAULT now() + interval '1 hour';

-- CreateTable
CREATE TABLE "OrderBook" (
    "id" SERIAL NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "bestBuyOrderId" INTEGER,
    "bestSellOrderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderBook_coinSymbol_key" ON "OrderBook"("coinSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "OrderBook_bestBuyOrderId_key" ON "OrderBook"("bestBuyOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderBook_bestSellOrderId_key" ON "OrderBook"("bestSellOrderId");

-- CreateIndex
CREATE INDEX "OrderBook_coinSymbol_idx" ON "OrderBook"("coinSymbol");

-- AddForeignKey
ALTER TABLE "OrderBook" ADD CONSTRAINT "OrderBook_bestBuyOrderId_fkey" FOREIGN KEY ("bestBuyOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBook" ADD CONSTRAINT "OrderBook_bestSellOrderId_fkey" FOREIGN KEY ("bestSellOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
