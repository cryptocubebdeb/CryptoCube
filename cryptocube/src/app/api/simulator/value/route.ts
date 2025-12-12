// /app/api/simulator/value/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthSession } from "@/app/lib/getServerSession";

/**
 * Convert our stored coinSymbol into a Binance trading pair.
 * BTC       -> BTCUSDT
 * BTCUSDT   -> BTCUSDT
 * trxusdt   -> TRXUSDT
 */
function toBinanceSymbol(coinSymbol: string): string {
  const upper = coinSymbol.toUpperCase();
  if (upper.endsWith("USDT")) return upper;
  return `${upper}USDT`;
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 1) Get simulator account with holdings + realized PnL + cash
    const sim = await prisma.simulatorAccount.findUnique({
      where: { userId: session.user.id },
      include: {
        portfolio: true,
      },
    });

    if (!sim) {
      return NextResponse.json(
        { error: "No simulator account" },
        { status: 404 }
      );
    }

    const cash = Number(sim.currentCashBalance || 0);
    const realizedProfitUsd = Number(sim.realizedProfitUsd || 0);
    const holdings = sim.portfolio;

    // If no holdings, everything is trivial
    if (holdings.length === 0) {
      return NextResponse.json({
        cash,
        investedCapital: 0,
        positionsValue: 0,
        portfolioValue: cash,
        unrealizedPnl: 0,
        unrealizedPct: 0,
        totalReturnUsd: realizedProfitUsd,
        totalReturnPct: 0,
        realizedProfitUsd,
        holdings: [],
      });
    }

    // 2) Fetch ALL Binance prices once
    const tickerRes = await fetch("https://api.binance.com/api/v3/ticker/price");
    const tickerJson: { symbol: string; price: string }[] = await tickerRes.json();

    const priceMap: Record<string, number> = {};
    for (const t of tickerJson) {
      priceMap[t.symbol] = parseFloat(t.price);
    }

    // 3) Compute invested capital & current positions value
    let investedCapital = 0;
    let positionsValue = 0;

    const enrichedHoldings = holdings.map((h) => {
      const amount = Number(h.amountOwned);
      const avg = Number(h.averageEntryPriceUsd);
      investedCapital += amount * avg;

      const binanceSymbol = toBinanceSymbol(h.coinSymbol);
      const livePrice = priceMap[binanceSymbol] ?? avg; // fallback: cost basis if no market price
      const currentValue = amount * livePrice;

      positionsValue += currentValue;

      return {
        id: h.id,
        coinId: h.coinId,
        coinSymbol: h.coinSymbol,
        amountOwned: amount,
        averageEntryPriceUsd: avg,
        currentPriceUsd: livePrice,
        currentValueUsd: currentValue,
      };
    });

    // 4) Aggregate metrics
    const portfolioValue = cash + positionsValue;
    const unrealizedPnl = positionsValue - investedCapital;
    const unrealizedPct =
      investedCapital > 0 ? (unrealizedPnl / investedCapital) * 100 : 0;

    const totalReturnUsd = realizedProfitUsd + unrealizedPnl;
    const totalReturnPct =
      investedCapital > 0 ? (totalReturnUsd / investedCapital) * 100 : 0;

    return NextResponse.json({
      cash,
      investedCapital,
      positionsValue,
      portfolioValue,
      unrealizedPnl,
      unrealizedPct,
      totalReturnUsd,
      totalReturnPct,
      realizedProfitUsd,
      holdings: enrichedHoldings,
    });
  } catch (err) {
    console.error("Error in /api/simulator/value:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
