import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const API_KEY = process.env.NEWSAPI_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ articles: [] });
  }

  const { searchParams } = new URL(req.url);
  const coin = searchParams.get("coin") ?? "crypto";

  const response = await fetch(
    `https://newsapi.org/v2/everything` +
      `?q=${encodeURIComponent(`${coin} crypto OR ${coin} cryptocurrency`)}` +
      `&searchIn=title,description` +
      `&language=en` +
      `&sortBy=publishedAt` +
      `&pageSize=10`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 },
    }
  );

  const data = await response.json();

  return NextResponse.json({
    articles: (data.articles || []).map((a: any, i: number) => ({
      id: `${coin}-${i}`,
      title: a.title,
      url: a.url,
      description: a.description,
      created_at: a.publishedAt,
      news_site: a.source?.name,
      thumbnail: a.urlToImage || "/placeholder.png",
    })),
  });
}
