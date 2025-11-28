import { prisma } from "@/app/lib/prisma";
import { OrderStatus, TradeType } from "@prisma/client";

export async function executeTrade(order, price: number, filledAmount: number) {
    const totalCost = price * filledAmount;
    const simId = order.simulatorAccountId;

    //
    // UPDATE CASH + PORTFOLIO
    //

    if (order.orderType === TradeType.BUY) {
        // 1. Subtract cash
        await prisma.simulatorAccount.update({
            where: { id: simId },
            data: {
                currentCashBalance: { decrement: totalCost },
            },
        });

        // 2. Add to portfolio
        await prisma.portfolio.upsert({
            where: {
                simulatorAccountId_coinSymbol: {
                    simulatorAccountId: simId,
                    coinSymbol: order.coinSymbol,
                },
            },
            create: {
                simulatorAccountId: simId,
                coinSymbol: order.coinSymbol,
                coinId: order.coinId,
                amountOwned: filledAmount,
                averageEntryPriceUsd: price,
            },
            update: {
                amountOwned: { increment: filledAmount },
                averageEntryPriceUsd: price, 
            },
        });
    }

    if (order.orderType === TradeType.SELL) {
        // 1. Add cash
        await prisma.simulatorAccount.update({
            where: { id: simId },
            data: {
                currentCashBalance: { increment: totalCost },
            },
        });

        // 2. Subtract portfolio holdings
        await prisma.portfolio.update({
            where: {
                simulatorAccountId_coinSymbol: {
                    simulatorAccountId: simId,
                    coinSymbol: order.coinSymbol,
                },
            },
            data: {
                amountOwned: { decrement: filledAmount },
            },
        });
    }

    //
    // RECORD TRADE HISTORY ENTRY
    //
    await prisma.tradeHistory.create({
        data: {
            simulatorAccountId: simId,
            orderId: order.id,
            tradeType: order.orderType,
            coinSymbol: order.coinSymbol,
            amountTraded: filledAmount,
            tradePrice: price,
            tradeTotal: totalCost,
        },
    });

    //
    // MARK ORDER EXECUTED
    //
    await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.EXECUTED },
    });
}
