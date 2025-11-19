import { PrismaClient, TradeType } from "@prisma/client";

const prismaClient = new PrismaClient();

/*
    This function is responsible for executing one single order.
    This is where an order becomes EXECUTED or CANCELLED.
*/
export async function executeOrder({
    orderId,
    simulatorAccountId,
    coinSymbol,
    type,
    amount,
    price
}) {
    console.log("[EXECUTE] Starting execution for order " + orderId + " (" + type + ")");

    return await prismaClient.$transaction(async (transactionDatabase) => {

        //load the portfolio for this user and this coin
        let portfolioRecord = await transactionDatabase.portfolio.findUnique({
            where: {
                simulatorAccountId_coinSymbol: {
                    simulatorAccountId: simulatorAccountId,
                    coinSymbol: coinSymbol
                }
            }
        });

        const totalOrderValue = price * amount;



        // ============== BUY ORDER SECTION ==============

        /*  remove the cash first, if portfolio does not exist, create a new record
            otherwise update amount owned and the weighted average price    */
        if (type === TradeType.BUY) {

            // Remove cash equal to the total value of the order
            await transactionDatabase.simulatorAccount.update({
                where: { id: simulatorAccountId },
                data: {
                    currentCashBalance: { decrement: totalOrderValue }
                }
            });

            // If the user never owned this coin, we create a portfolio entry
            if (!portfolioRecord) {
                portfolioRecord = await transactionDatabase.portfolio.create({
                    data: {
                        simulatorAccountId: simulatorAccountId,
                        coinSymbol: coinSymbol,
                        amountOwned: amount,
                        averageEntryPriceUsd: price
                    }
                });
            } else {
                // If a portfolio exists, update the values
                const oldAmountOwned = Number(portfolioRecord.amountOwned);
                const oldAveragePrice = Number(portfolioRecord.averageEntryPriceUsd);

                const newTotalAmountOwned = oldAmountOwned + amount;

                const newAveragePrice = (oldAmountOwned * oldAveragePrice + amount * price) / newTotalAmountOwned;

                await transactionDatabase.portfolio.update({
                    where: { id: portfolioRecord.id },
                    data: {
                        amountOwned: newTotalAmountOwned,
                        averageEntryPriceUsd: newAveragePrice
                    }
                });
            }
        }



        // ============= SELL ORDER SECTION =============
        // check if the user owns enough coins if not: CANCEL the order if yes: update cash, remove coins, and calculate profit
        if (type === TradeType.SELL) {

            const doesPortfolioExist = !!portfolioRecord;
            const ownsEnoughCoins =
                doesPortfolioExist &&
                Number(portfolioRecord.amountOwned) >= amount;

            // User tried to sell coins they do not have
            if (!ownsEnoughCoins) {
                console.log("[EXECUTE] Auto-cancelling order " + orderId + " because user does not have enough coins");

                await transactionDatabase.order.update({
                    where: { id: orderId },
                    data: {
                        status: "CANCELLED"
                    }
                });

                throw new Error("Order was cancelled because user does not have enough coins");
            }

            // if user owns enough tokens, execute the sell
            const previousAmountOwned = Number(portfolioRecord.amountOwned);
            const newRemainingAmount = previousAmountOwned - amount;
            const averageEntryPrice = Number(portfolioRecord.averageEntryPriceUsd);

            // Calculate the profit for the sell
            const profitFromTrade = (price - averageEntryPrice) * amount;

            // Add the cash and update profit
            await transactionDatabase.simulatorAccount.update({
                where: { id: simulatorAccountId },
                data: {
                    currentCashBalance: { increment: totalOrderValue },
                    realizedProfitUsd: { increment: profitFromTrade }
                }
            });

            // Update portfolio depending on remaining amount
            if (newRemainingAmount > 0) {
                await transactionDatabase.portfolio.update({
                    where: { id: portfolioRecord.id },
                    data: {
                        amountOwned: newRemainingAmount
                    }
                });
            } else {
                // If the user sold everything, remove the portfolio entry
                await transactionDatabase.portfolio.delete({
                    where: { id: portfolioRecord.id }
                });
            }
        }



        // Storing trade in the tradeHistory table (db)
        await transactionDatabase.tradeHistory.create({
            data: {
                simulatorAccountId: simulatorAccountId,
                coinSymbol: coinSymbol,
                tradeType: type,
                amountTraded: amount,
                tradePrice: price,
                tradeTotal: totalOrderValue
            }
        });

        // Mark order as executed
        await transactionDatabase.order.update({
            where: { id: orderId },
            data: {
                status: "EXECUTED",
                executedAt: new Date()
            }
        });

        console.log("[EXECUTE] Order " + orderId + " executed successfully.");

        return true;
    });
}
