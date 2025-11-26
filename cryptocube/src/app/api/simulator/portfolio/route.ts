// app/api/simulator/portfolio/route.ts
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
      include: { portfolio: true },
    });

    if (!simulatorAccount) {
      return NextResponse.json(
        { error: "Simulator account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cash: Number(simulatorAccount.currentCashBalance),
      initialCash: Number(simulatorAccount.initialCashBalance),
      realizedProfitUsd: Number(simulatorAccount.realizedProfitUsd),
      holdings: simulatorAccount.portfolio.map((portfolio) => ({
        id: portfolio.id,
        coinId: portfolio.coinId,
        coinSymbol: portfolio.coinSymbol,
        amountOwned: Number(portfolio.amountOwned),
        averageEntryPriceUsd: Number(portfolio.averageEntryPriceUsd),
      })),
    });
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
