import { NextResponse } from "next/server";

export const revalidate = 300; // cache 5 min

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get("coin");

  if (!coin) {
    return NextResponse.json([], { status: 200 });
  }

  const API_KEY = process.env.NEWSAPI_API_KEY;
  if (!API_KEY) {
    return NextResponse.json([], { status: 200 });
  }

  const q = encodeURIComponent(
    `${coin} AND (crypto OR cryptocurrency OR blockchain)`
  );

  const res = await fetch(
    `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=9&apiKey=${API_KEY}`
  );

  if (!res.ok) {
    // swallow NewsAPI errors to avoid breaking UI
    return NextResponse.json([], { status: 200 });
  }

  const data = await res.json();

  const articles = (data.articles ?? []).map((a: any, i: number) => ({
    id: String(i),
    title: a.title,
    url: a.url,
    description: a.description,
    created_at: a.publishedAt,
    news_site: a.source?.name,
    thumbnail: a.urlToImage,
  }));

  return NextResponse.json(articles);
}
