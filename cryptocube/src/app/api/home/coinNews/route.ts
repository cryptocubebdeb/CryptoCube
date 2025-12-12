import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get("coin") ?? "crypto";
  const limit = Number(searchParams.get("limit") || 10);

  const API_KEY = process.env.NEWSAPI_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing NEWSAPI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const query = encodeURIComponent(
      `${coin} AND (cryptocurrency OR crypto OR blockchain OR price)`
    );

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${API_KEY}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`News API error ${response.status}`);
    }

    const data = await response.json();

    const articles = (data.articles || []).map(
      (article: any, index: number) => ({
        id: `${coin}-${index}`,
        title: article.title,
        url: article.url,
        description: article.description,
        created_at: article.publishedAt,
        news_site: article.source?.name ?? "Unknown",
        thumbnail: article.urlToImage || "/placeholder.png",
      })
    );

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching coin news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
