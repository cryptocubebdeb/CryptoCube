import { NextResponse } from "next/server";

// IMPORTANT: force runtime execution in production
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE_URL = "https://api.coingecko.com/api/v3";

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    console.error("COINGECKO_API_KEY is missing at runtime");
    return NextResponse.json(
      { error: "Missing COINGECKO_API_KEY in environment" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets` +
        `?vs_currency=usd` +
        `&order=price_change_percentage_24h_desc` +
        `&per_page=10` +
        `&page=1` +
        `&sparkline=true` +
        `&price_change_percentage=24h,7d`,
      {
        headers: {
          // FREE CoinGecko demo key
          "x-cg-demo-api-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko error ${response.status}`);
    }

    const coins = await response.json();

    return NextResponse.json({ coins });
  } catch (error) {
    console.error("Top gainers fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch top gainers" },
      { status: 500 }
    );
  }
}
