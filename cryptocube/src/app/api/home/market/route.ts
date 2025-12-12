import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing CoinGecko API key" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets" +
        "?vs_currency=usd" +
        "&order=market_cap_desc" +
        "&per_page=50" +
        "&page=1" +
        "&price_change_percentage=24h",
      {
        headers: {
          "x-cg-pro-api-key": apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    const data = await response.json();

    return NextResponse.json({ coins: data });
  } catch (error) {
    console.error("Market overview fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
