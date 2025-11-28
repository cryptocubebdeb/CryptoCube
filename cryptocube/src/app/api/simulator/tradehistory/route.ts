import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthSession } from "@/app/lib/getServerSession";

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!simulatorAccount) {
            return NextResponse.json(
                { error: "Simulator account not found" },
                { status: 404 }
            );
        }

        // Fetch all trade history entries for the user
        const trades = await prisma.tradeHistory.findMany({
            where: {
                simulatorAccountId: simulatorAccount.id,
            },
            orderBy: {
                executedAt: "desc",
            },
            include: {
                order: true,  
            }
        });

        // Format trade history
        const formatted = trades.map(t => ({
            id: t.id,
            tradeType: t.tradeType,             
            coinSymbol: t.coinSymbol,
            amountTraded: Number(t.amountTraded),
            tradePrice: Number(t.tradePrice),
            tradeTotal: Number(t.tradeTotal),
            executedAt: t.executedAt,
            orderId: t.orderId
        }));

        return NextResponse.json({ history: formatted });

    } catch (error) {
        console.error("Error fetching trade history:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
