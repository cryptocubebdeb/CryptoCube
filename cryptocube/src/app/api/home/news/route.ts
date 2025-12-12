import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing News API key" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=crypto&language=en&pageSize=10`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        next: { revalidate: 300 },
      }
    );

    const data = await response.json();

    return NextResponse.json({ articles: data.articles || [] });
  } catch (error) {
    console.error("News fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
