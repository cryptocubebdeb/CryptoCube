import { PrismaClient, TradeType, OrderStatus } from "@prisma/client";

const prismaClient = new PrismaClient();

/*
    This function updates the “local order book” for one specific coin.
    The goal is simply to figure out what the best BUY and best SELL
    prices are among the user’s pending limit orders stored in our database.

    Important:
      - This has nothing to do with Binance prices.
      - Binance prices are handled by the worker through the WebSocket.
      - Here we only consider LOCAL orders created by the user.

    What we are looking for:
      - The highest priced BUY order (because the best buy is always the highest price)
      - The lowest priced SELL order (because the best sell is always the lowest price)

    After we find these two local orders, we save them inside the orderBook table.
    The workers will later use this information if needed.
*/
export async function recomputeOrderBook(coinSymbol) {

    /*
        Step one: get the highest priced pending BUY order.
        If there are no BUY orders for this coin, this returns null.
    */
    const bestLocalBuyOrder = await prismaClient.order.findFirst({
        where: {
            coinSymbol: coinSymbol,
            orderType: TradeType.BUY,
            status: OrderStatus.PENDING,
            price: { not: null }
        },
        orderBy: {
            price: "desc"   // highest price first
        }
    });

    /*
        Step two: get the lowest priced pending SELL order.
        If there are no SELL orders for this coin, this returns null.
    */
    const bestLocalSellOrder = await prismaClient.order.findFirst({
        where: {
            coinSymbol: coinSymbol,
            orderType: TradeType.SELL,
            status: OrderStatus.PENDING,
            price: { not: null }
        },
        orderBy: {
            price: "asc"    // lowest price first
        }
    });


    // update the orderBook table.
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
