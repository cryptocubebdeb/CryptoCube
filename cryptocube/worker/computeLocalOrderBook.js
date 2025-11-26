import { PrismaClient, TradeType, OrderStatus } from "@prisma/client";

const prismaClient = new PrismaClient();

/*
    This function updates the “local order book” for one specific coin.
    The goal is simply to figure out what the best BUY and best SELL
    prices are among the user’s pending limit orders stored in our database.

    Important:
      - This has nothing to do with Binance prices.
      - Binance prices are handled by the worker through the WebSocket.
      - Here we only consider LOCAL orders created by the users.

    What we are looking for:
      - The highest priced BUY order (because the best buy is always the highest price)
      - The lowest priced SELL order (because the best sell is always the lowest price)

    After we find these two local orders, we save them inside the orderBook table.
    The workers will later use this information if needed and will be the informations compared to the binance order book.
*/
export async function recomputeLocalOrderBook(coinSymbol) {

    // get the highest priced pending BUY order
    const bestLocalBuyOrder = await prismaClient.order.findFirst({
        where: {
            coinSymbol: coinSymbol,
            orderType: TradeType.BUY,
            status: OrderStatus.PENDING,
            price: { not: null } // If there are no BUY orders for this coin, this returns null.
        },
        orderBy: {
            price: "desc"   // highest price first
        }
    });

    // Get the lowest priced pending SELL order.
    const bestLocalSellOrder = await prismaClient.order.findFirst({
        where: {
            coinSymbol: coinSymbol,
            orderType: TradeType.SELL,
            status: OrderStatus.PENDING,
            price: { not: null } // If there are no SELL orders for this coin, this returns null.
        },
        orderBy: {
            price: "asc"    // lowest price first
        }
    });


    // Update the orderBook table.
    // If a record already exists for this coin, update it.
    await prismaClient.orderBook.upsert({
        where: {
            coinSymbol: coinSymbol
        },

    // For bestBuyOrderId and bestSellOrderId, we store null if no order exists.
        create: {
            coinSymbol: coinSymbol,
            bestBuyOrderId: bestLocalBuyOrder ? bestLocalBuyOrder.id : null,
            bestSellOrderId: bestLocalSellOrder ? bestLocalSellOrder.id : null
        },
        update: {
            bestBuyOrderId: bestLocalBuyOrder ? bestLocalBuyOrder.id : null,
            bestSellOrderId: bestLocalSellOrder ? bestLocalSellOrder.id : null
        }
    });
}
