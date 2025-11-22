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

        // Get or create simulator account
        let simulator = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
            include: {
                portfolio: {
                    select: {
                        id: true,
                        coinSymbol: true,
                        coinId: true,                 // ⬅️ make sure this is selected
                        amountOwned: true,
                        averageEntryPriceUsd: true,
                    }
                }
            }
        });

        if (!simulator) {
            simulator = await prisma.simulatorAccount.create({
                data: {
                    userId: session.user.id,
                    initialCashBalance: 10000,
                    currentCashBalance: 10000
                },
                include: {
                    portfolio: {
                        select: {
                            id: true,
                            coinSymbol: true,
                            coinId: true,
                            amountOwned: true,
                            averageEntryPriceUsd: true,
                        }
                    }
                }
            });
        }

        // Return data in frontend-friendly format
        return NextResponse.json({
            currentCash: Number(simulator.currentCashBalance),

            portfolio: simulator.portfolio.map((p) => ({
                id: p.id,
                coinSymbol: p.coinSymbol,
                coinId: p.coinId,                                   // ⬅️ now included
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
