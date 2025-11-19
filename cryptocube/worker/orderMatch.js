import { PrismaClient, TradeType, OrderStatus } from "@prisma/client";
import { executeOrder } from "./executeOrder.js";
import { recomputeOrderBook } from "./orderBook.js";
import { orderWorkerManager } from "./orderWorkerManager.js";

const prismaClient = new PrismaClient();

// This helper function triggers the execution of a single order.
async function executeLocalFill(orderRecord, executionPrice) {

    await executeOrder({
        orderId: orderRecord.id,
        simulatorAccountId: orderRecord.simulatorAccountId,
        coinSymbol: orderRecord.coinSymbol,
        type: orderRecord.orderType,
        amount: orderRecord.amount,
        price: executionPrice
    });
}


// Main function that runs every time we receive a new Binance orderbook update through the worker.
export async function matchLocalOrders(symbolName, orderBookMemory) {

    console.log("\n================ MATCH CHECK (" + symbolName + ") ================");

    // Print the current best levels that we have in memory from Binance
    console.log("[ORDERBOOK] Top bid:", orderBookMemory.bids[0]);
    console.log("[ORDERBOOK] Top ask:", orderBookMemory.asks[0]);


    // load all pending orders from the database, sorted by creation time so older orders are matched first.
    const pendingOrders = await prismaClient.order.findMany({
        where: {
            coinSymbol: symbolName,
            status: OrderStatus.PENDING
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    console.log("[PENDING LOCAL ORDERS] " + pendingOrders.length);
    pendingOrders.forEach(orderRecord => {
        console.log(" - id:" + orderRecord.id + " " + orderRecord.orderType + " " + orderRecord.amount + "@" + orderRecord.price);
    });

    if (pendingOrders.length === 0) {
        console.log("[MATCH] No pending orders, skipping match cycle.");
        return;
    }


    // Extract the top Binance prices for comparison.
    // If either side is missing, we cannot match certain orders.
    const bestAskPrice = orderBookMemory.asks[0]?.price ? Number(orderBookMemory.asks[0].price) : null;
    const bestBidPrice = orderBookMemory.bids[0]?.price ? Number(orderBookMemory.bids[0].price) : null;

    console.log("[BINANCE PRICES] bestBid=" + bestBidPrice + " bestAsk=" + bestAskPrice);


    // loop through each pending order and check if its condition is met.
    for (const orderRecord of pendingOrders) {

        // Make sure the order is still pending at the exact moment of checking
        const orderStatusCheck = await prismaClient.order.findUnique({
            where: { id: orderRecord.id },
            select: { status: true }
        });

        if (orderStatusCheck.status !== OrderStatus.PENDING) {
            console.log("[" + symbolName + "] Order " + orderRecord.id + " is " + orderStatusCheck.status + ", skipping.");
            continue;
        }

        console.log("\nChecking order " + orderRecord.id + ": " + orderRecord.orderType + " at price " + orderRecord.price);



        // ===========  BUY LIMIT ORDER LOGIC ===========
        if (orderRecord.orderType === TradeType.BUY) {

            if (!orderRecord.price) {
                console.log("Market BUY orders not implemented yet, skipping.");
                continue;
            }

            if (bestAskPrice === null) {
                console.log("No ask price available from Binance, skipping BUY check.");
                continue;
            }

            console.log("BUY condition: best ask (" + bestAskPrice + ") <= user limit (" + orderRecord.price + ")");

            if (bestAskPrice <= Number(orderRecord.price)) {
                console.log("MATCHED BUY. Executing order now...");
                try {
                    await executeLocalFill(orderRecord, bestAskPrice);
                } catch (error) {
                    console.log("[" + symbolName + "] Error executing BUY for order " + orderRecord.id + ": " + error.message);
                }
            } else {
                console.log("Not matchable yet.");
            }
        }



        // ===========  SELL LIMIT ORDER LOGIC ===========
        if (orderRecord.orderType === TradeType.SELL) {

            if (!orderRecord.price) {
                console.log("Market SELL orders not implemented yet, skipping.");
                continue;
            }

            if (bestBidPrice === null) {
                console.log("No bid price available from Binance, skipping SELL check.");
                continue;
            }

            console.log("SELL condition: best bid (" + bestBidPrice + ") >= user limit (" + orderRecord.price + ")");

            if (bestBidPrice >= Number(orderRecord.price)) {
                console.log("MATCHED SELL. Executing order now...");
                try {
                    await executeLocalFill(orderRecord, bestBidPrice);
                } catch (error) {
                    console.log("[" + symbolName + "] Error executing SELL for order " + orderRecord.id + ": " + error.message);
                }
            } else {
                console.log("Not matchable yet.");
            }
        }
    }



    // update the local orderBook table in the database.
    // This stores the best local BUY and SELL according to our pending orders.
    console.log("[MATCH] Recomputing local order book in database...");
    await recomputeOrderBook(symbolName);



    // check if the worker for this symbol should stop.
    // If no pending orders remain, the worker can safely disconnect.
    console.log("[MATCH] Checking if worker should stop for symbol " + symbolName + "...");
    await orderWorkerManager.checkIfWorkerShouldStop(symbolName);

    console.log("================ END MATCH (" + symbolName + ") ================\n");
}
