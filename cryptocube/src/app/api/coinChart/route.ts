import { NextResponse } from "next/server";
import { getCoinChart } from "@/app/lib/getCoinChart";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coinId = searchParams.get("coinId");
  const days = Number(searchParams.get("days") || 30);
  const currency = searchParams.get("currency") || "cad";

  try {
    const data = await getCoinChart(coinId!, days, currency);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API /coinChart failed:", error);
    return NextResponse.json({ error: "Failed to fetch coin data" }, { status: 500 });
  }
}
