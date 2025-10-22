import { NextResponse } from "next/server";

const URL_API = "https://api.coingecko.com/api/v3";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    if (!categoryId) {
        return NextResponse.json({ error: "Missing categoryId parameter" }, { status: 400 });
    }

    const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (!API_KEY) {
        throw new Error("Missing NEXT_PUBLIC_COINGECKO_API_KEY in environment.");
    }

    const options = {
        method: "GET",
        headers: { "x-cg-demo-api-key": API_KEY, },
    };

    let totalCount = 0;
    let page = 1;
    let hasMore = true;

    try {
        while (hasMore) {
            const response = await fetch(
                `${URL_API}/coins/markets?vs_currency=usd&category=${categoryId}&per_page=50&page=${page}`,
                options
            );

            if (!response.ok) {
                throw new Error(`CoinGecko error ${response.status}`);
            }

            const data = await response.json();
            totalCount += data.length;
            hasMore = data.length === 50;
            page += 1;
        }
    
        return NextResponse.json({ count: totalCount });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch asset count" }, { status: 500 });
    }
}