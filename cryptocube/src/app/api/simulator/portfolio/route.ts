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

        //We are getting the user simulator account
        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
            include: {  
                portfolio: true,
            },
        });

        if (!simulatorAccount) {
            return NextResponse.json(
                { error: "Simulator account not found" },
                { status: 404 }
            );
        }

        //We need to convert the decimals returned by prisma to numbers (prisma returns them as objects)
        return NextResponse.json({
            currentCash: Number(simulatorAccount.currentCashBalance),
            portfolio: simulatorAccount.portfolio.map((portfolio) => ({
                id: portfolio.id,
                coinSymbol: portfolio.coinSymbol,
                coinId: portfolio.coinId,
                amountOwned: Number(portfolio.amountOwned),
                averageEntryPriceUsd: Number(portfolio.averageEntryPriceUsd),
            })),
        });
    }
    catch (error) {
        console.error("Error fetching portfolio:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
