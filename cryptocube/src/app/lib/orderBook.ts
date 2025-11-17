// app/lib/orderBook.ts
import { PrismaClient, TradeType, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Recompute best buy & sell for a given coin and update OrderBook
export async function recomputeOrderBook(coinSymbol: string) {
  // best BUY = highest price pending BUY
  const bestBuy = await prisma.order.findFirst({
    where: {
      coinSymbol,
      orderType: TradeType.BUY,
      status: OrderStatus.PENDING,
      price: { not: null },
    },
    orderBy: { price: "desc" },
  });

  // best SELL = lowest price pending SELL
  const bestSell = await prisma.order.findFirst({
    where: {
      coinSymbol,
      orderType: TradeType.SELL,
      status: OrderStatus.PENDING,
      price: { not: null },
    },
    orderBy: { price: "asc" },
  });

  await prisma.orderBook.upsert({
    where: { coinSymbol },
    create: {
      coinSymbol,
      bestBuyOrderId: bestBuy?.id ?? null,
      bestSellOrderId: bestSell?.id ?? null,
    },
    update: {
      bestBuyOrderId: bestBuy?.id ?? null,
      bestSellOrderId: bestSell?.id ?? null,
    },
  });
}
