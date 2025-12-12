import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin");

  if (!coin) {
    return NextResponse.json({ articles: [] });
  }

  const API_KEY = process.env.NEWSAPI_API_KEY;
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing NEWSAPI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const cryptoTerms =
      "cryptocurrency OR crypto OR blockchain OR price OR market OR trading OR token";

    const q = encodeURIComponent(`${coin} AND (${cryptoTerms})`);

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${q}&searchIn=title,description&language=en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`News API error ${response.status}`);
    }

    const data = await response.json();

    const articles = (data.articles ?? [])
      .filter((article: any) => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        return text.includes(coin.toLowerCase());
      })
      .map((article: any, index: number) => ({
        id: index.toString(),
        title: article.title,
        url: article.url,
        description: article.description,
        created_at: article.publishedAt,
        news_site: article.source?.name,
        thumbnail: article.urlToImage || "/placeholder.png",
      }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Coin news fetch failed:", error);
    return NextResponse.json({ articles: [] });
  }
}