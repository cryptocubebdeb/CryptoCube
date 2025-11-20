import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/app/lib/getServerSession";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getAuthSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        //Get or create the user’s simulatorAccount
        let simulator = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
            include: {
                portfolio: true
            }
        });

        if (!simulator) {
            // Auto-create account if missing
            simulator = await prisma.simulatorAccount.create({
                data: {
                    userId: session.user.id,
                    initialCashBalance: 10000,
                    currentCashBalance: 10000
                },
                include: { portfolio: true }
            });
        }

        // Format response so frontend gets EXACT names it expects
        return NextResponse.json({
            currentCash: Number(simulator.currentCashBalance),
            portfolio: simulator.portfolio.map((p) => ({
                coinSymbol: p.coinSymbol,
                amountOwned: Number(p.amountOwned),
                averageEntryPriceUsd: Number(p.averageEntryPriceUsd)
            }))
        });

    } catch (error) {
        console.error("[GET PORTFOLIO ERROR]", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
