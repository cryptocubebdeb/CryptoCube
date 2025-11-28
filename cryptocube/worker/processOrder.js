// executeOrder.js
import { PrismaClient, TradeType } from "@prisma/client";
import { logOrderEvent, logErrorEvent } from "./logger.js";

// Create a Prisma client to interact with the database
const prismaClient = new PrismaClient();

/**
 * Executes a trade order for a simulator account.
 * This includes updating the account's cash balance, portfolio, trade history, and order status.
 * All operations are performed inside a Prisma transaction to ensure consistency:
 * if any step fails, all database changes are rolled back.
 */
export async function executeOrder({
    orderId,
    simulatorAccountId,
    coinId,             // <-- FIX: added coinId here
    coinSymbol,
    type,               // TradeType.BUY or TradeType.SELL
    amount,             // Quantity of coins to buy/sell
    price               // Price per coin
}) {
    console.log(`[EXECUTE] Starting order ${orderId} (${type}) at price ${price}`);

    // Convert inputs to numbers and calculate the total trade value
    const numericAmount = Number(amount);
    const numericPrice = Number(price);
    const totalTradeValue = numericAmount * numericPrice; // Total value of the transaction

    // Start a transaction: all operations inside are atomic (succeed together or fail together)
    return await prismaClient.$transaction(async (transaction) => {
        try {
            // Load the account from the database
            const account = await transaction.simulatorAccount.findUnique({
                where: { id: simulatorAccountId }
            });

            if (!account) throw new Error("Simulator account not found");

            // Check if the portfolio already contains this coin (this will influence the logic below for some data)
            let portfolioEntry = await transaction.portfolio.findUnique({
                where: {
                    simulatorAccountId_coinSymbol: {
                        simulatorAccountId,
                        coinSymbol
                    }
                }
            });

            /* 
               =========== BUY ORDER LOGIC ============
               
               For a buy order:
               - Ensure the account has enough cash.
               - Deduct the cash.
               - Create a new portfolio entry if it doesn't exist, or update the existing one.
               - Update the average entry price to reflect weighted cost.
            */
            if (type === TradeType.BUY) {
                const sufficientCash = account.currentCashBalance >= totalTradeValue;

                if (!sufficientCash) {
                    // Cancel the order because there isn't enough cash
                    await transaction.order.update({
                        where: { id: orderId },
                        data: { status: "CANCELLED" }
                    });

                    // Log the cancellation event for auditing
                    logOrderEvent("CANCELLED", {
                        orderId,
                        coinSymbol,
                        simulatorAccountId,
                        reason: "INSUFFICIENT_CASH",
                        requiredCash: totalTradeValue,
                        availableCash: account.currentCashBalance
                    });

                    console.log(`[CANCELLED] BUY order ${orderId} cancelled: insufficient cash`);
                    return false;
                }

                // Deduct the required cash from the account
                await transaction.simulatorAccount.update({
                    where: { id: simulatorAccountId },
                    data: { currentCashBalance: { decrement: totalTradeValue } }
                });

                // Handle portfolio entry
                if (!portfolioEntry) {
                    // If no portfolio entry exists, create it with the purchase amount and price
                    portfolioEntry = await transaction.portfolio.create({
                        data: {
                            simulatorAccountId,
                            coinId,                 // <-- FIX: added coinId here
                            coinSymbol,
                            amountOwned: numericAmount,
                            averageEntryPriceUsd: numericPrice // Initial average price is the purchase price
                        }
                    });
                } else {
                    // If portfolio exists, update the amount and recalculate weighted average price
                    const previousAmount = Number(portfolioEntry.amountOwned);
                    const previousAveragePrice = Number(portfolioEntry.averageEntryPriceUsd);
                    const newAmount = previousAmount + numericAmount;
                    const newAveragePrice =
                        (previousAmount * previousAveragePrice +
                            numericAmount * numericPrice) /
                        newAmount; // Weighted average price calculation

                    await transaction.portfolio.update({
                        where: { id: portfolioEntry.id },
                        data: {
                            amountOwned: newAmount,
                            averageEntryPriceUsd: newAveragePrice
                        }
                    });
                }
            }

            /* 
               =========== SELL ORDER LOGIC ============
               
               For a sell order:
               - Ensure the portfolio has enough coins.
               - Calculate realized profit.
               - Add cash to account and update realized profit.
               - Update or delete portfolio entry depending on remaining coins.
            */
            if (type === TradeType.SELL) {
                const sufficientCoins =
                    portfolioEntry &&
                    Number(portfolioEntry.amountOwned) >= numericAmount;

                if (!sufficientCoins) {
                    // Cancel the order because not enough coins to sell
                    await transaction.order.update({
                        where: { id: orderId },
                        data: { status: "CANCELLED" }
                    });

                    logOrderEvent("CANCELLED", {
                        orderId,
                        coinSymbol,
                        simulatorAccountId,
                        reason: "INSUFFICIENT_COINS",
                        requiredAmount: numericAmount,
                        availableAmount: portfolioEntry?.amountOwned || 0
                    });

                    console.log(`[EXECUTE] SELL order ${orderId} cancelled: insufficient coins`);
                    return false;
                }

                const previousAmount = Number(portfolioEntry.amountOwned);
                const newAmount = previousAmount - numericAmount;
                const averageEntryPrice = Number(portfolioEntry.averageEntryPriceUsd);
                const realizedProfit =
                    (numericPrice - averageEntryPrice) * numericAmount;

                // Add cash to the account and increment realized profit
                await transaction.simulatorAccount.update({
                    where: { id: simulatorAccountId },
                    data: {
                        currentCashBalance: { increment: totalTradeValue },
                        realizedProfitUsd: { increment: realizedProfit }
                    }
                });

                // Update portfolio or remove it if all coins are sold
                if (newAmount > 0) {
                    await transaction.portfolio.update({
                        where: { id: portfolioEntry.id },
                        data: { amountOwned: newAmount }
                    });
                } else {
                    await transaction.portfolio.delete({
                        where: { id: portfolioEntry.id }
                    });
                }
            }

            // =========== TRADE HISTORY LOGIC ============
            await transaction.tradeHistory.create({
                data: {
                    simulatorAccountId,
                    coinSymbol,
                    tradeType: type,
                    amountTraded: numericAmount,
                    tradePrice: numericPrice,
                    tradeTotal: totalTradeValue
                }
            });

            // =========== FINALIZE ORDER ============
            // Mark the order as executed and log it.
            // The transaction ensures all updates are atomic.
            await transaction.order.update({
                where: { id: orderId },
                data: {
                    status: "EXECUTED",
                    executedAt: new Date()
                }
            });

            logOrderEvent("EXECUTED", {
                orderId,
                coinSymbol,
                tradeType: type,
                amountTraded: numericAmount,
                tradePrice: numericPrice,
                totalTradeValue
            });

            console.log(`[EXECUTE] Order ${orderId} executed successfully`);
            return true;

        } catch (error) {
            // Any error will roll back the transaction
            logErrorEvent("executeOrder", error, {
                orderId,
                tradeType: type,
                coinSymbol,
                amount: numericAmount,
                price: numericPrice
            });
            console.error(`[FAILED TRANSACTION] Order ${orderId} failed:`, error);
            throw error;
        }
    });
}
