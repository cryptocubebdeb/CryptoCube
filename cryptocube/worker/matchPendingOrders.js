import { PrismaClient, TradeType, OrderStatus } from "@prisma/client";
import { executeOrder } from "./processOrder.js";
import { recomputeLocalOrderBook } from "./computeLocalOrderBook.js";
import { orderWorkerManager } from "./workerManager.js";
import { logOrderEvent, logErrorEvent, logWorkerEvent } from "./logger.js";

const prismaClient = new PrismaClient();

/**
 * Executes a single order at a given execution price by calling executeOrder.
 * This separates the matching logic from the actual execution logic.
 */
async function executeLocalFill(order, executionPrice) {
    return executeOrder({
        orderId: order.id,
        simulatorAccountId: order.simulatorAccountId,
        coinId: order.coinId,                 // <-- FIX ADDED
        coinSymbol: order.coinSymbol,
        type: order.orderType,
        amount: order.amount,
        price: executionPrice
    });
}

/**
 * Matches and executes pending orders for a given coin symbol against the local order book.
 * @param {string} symbol - The coin symbol to process (e.g., BTC)
 * @param {object} orderBook - Local order book containing bids and asks
 *
 * The function:
 * - Checks top bid/ask prices
 * - Iterates through pending orders in chronological order
 * - Executes market orders immediately at top bid/ask
 * - Executes limit orders only if market price satisfies limit
 * - Updates order book and checks worker status
 */
export async function matchLocalOrders(symbol, orderBook) {
    console.log(`\n================ MATCH (${symbol}) ================`);

    // Determine best available buy and sell prices in the order book
    const topBid = orderBook.bids[0]?.price ? Number(orderBook.bids[0].price) : null;
    const topAsk = orderBook.asks[0]?.price ? Number(orderBook.asks[0].price) : null;

    console.log("[ORDERBOOK] top bid:", topBid);
    console.log("[ORDERBOOK] top ask:", topAsk);

    // Fetch all pending orders for this coin, oldest first
    const pendingOrders = await prismaClient.order.findMany({
        where: { coinSymbol: symbol, status: OrderStatus.PENDING },
        orderBy: { createdAt: "asc" }
    });

    console.log(`[PENDING] ${pendingOrders.length} orders`);
    pendingOrders.forEach(order => console.log(` - id:${order.id} ${order.orderType} ${order.amount}@${order.price}`));

    if (pendingOrders.length === 0) {
        console.log("[MATCH] No pending orders.");
        return;
    }

    // Iterate through each pending order
    for (const order of pendingOrders) {
        // Refresh status to avoid executing non-pending orders
        const status = await prismaClient.order.findUnique({
            where: { id: order.id },
            select: { status: true }
        });

        if (status.status !== OrderStatus.PENDING) continue;

        // Convert price to number if set
        const limitPrice = order.price ? Number(order.price) : null;

        console.log(`\nChecking order ${order.id} (${order.orderType}) price=${limitPrice}`);

        // ============== MARKET BUY ORDER ==============
        // Executes immediately at lowest ask
        if (order.orderType === TradeType.BUY && order.orderKind === "MARKET") {
            if (topAsk === null) {
                console.log("No ask price — cannot fill MARKET BUY.");
                continue;
            }

            try {
                await executeLocalFill(order, topAsk);
            } catch (err) {
                logErrorEvent("MARKET_BUY", err, { orderId: order.id, topAsk });
            }
            continue;
        }

        // ================ BUY LIMIT ORDER ================
        // Executes only if top ask <= limit price
        if (order.orderType === TradeType.BUY && order.orderKind === "LIMIT") {
            if (topAsk === null) {
                console.log("No ask price — cannot match BUY LIMIT.");
                continue;
            }

            console.log(`BUY LIMIT: ask ${topAsk} <= limit ${limitPrice}`);

            if (topAsk <= limitPrice) {
                console.log("BUY LIMIT matched executing...");
                try {
                    await executeLocalFill(order, topAsk);
                } catch (err) {
                    logErrorEvent("BUY_LIMIT", err, { orderId: order.id, topAsk });
                }
            }
            continue;
        }

        // ================ MARKET SELL ORDER ================
        // Executes immediately at highest bid
        if (order.orderType === TradeType.SELL && order.orderKind === "MARKET") {
            if (topBid === null) {
                console.log("No bid price — cannot fill MARKET SELL.");
                continue;
            }

            try {
                await executeLocalFill(order, topBid);
            } catch (err) {
                logErrorEvent("MARKET_SELL", err, { orderId: order.id, topBid });
            }
            continue;
        }

        // ================ SELL LIMIT ORDER ================
        // Executes only if top bid >= limit price
        if (order.orderType === TradeType.SELL && order.orderKind === "LIMIT") {
            if (topBid === null) {
                console.log("No bid price — cannot match SELL LIMIT.");
                continue;
            }

            console.log(`SELL LIMIT: bid ${topBid} >= limit ${limitPrice}`);

            if (topBid >= limitPrice) {
                console.log("SELL LIMIT matched → executing...");
                try {
                    await executeLocalFill(order, topBid);
                } catch (err) {
                    logErrorEvent("SELL_LIMIT", err, { orderId: order.id, topBid });
                }
            }
            continue;
        }
    }

    // After all possible matches, recompute the local order book
    console.log("[MATCH] Updating DB order book...");
    await recomputeLocalOrderBook(symbol);

    // Check if the worker should stop running for this symbol
    console.log("[MATCH] Checking worker stop condition...");
    await orderWorkerManager.checkIfWorkerShouldStop(symbol);

    // Log completion of the match
    logWorkerEvent("MATCH_DONE", {
        symbol,
        topBid,
        topAsk,
        pendingCount: pendingOrders.length
    });

    console.log(`================ END MATCH (${symbol}) ================\n`);
}
