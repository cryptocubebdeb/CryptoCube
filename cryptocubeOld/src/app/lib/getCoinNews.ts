// /app/lib/getCoinNews.ts  (NewsAPI-based, coin-specific)
export async function getCoinNews(coinQuery: string, limit = 10) {
  const API_KEY = process.env.NEXT_PUBLIC_NEWSAPI_API_KEY;
  if (!API_KEY) throw new Error("Missing NEWSAPI_API_KEY in environment.");

  try {
    const q = encodeURIComponent(coinQuery); // e.g., "bitcoin OR BTC" or "solana OR SOL"

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${q}&searchIn=title,description&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${API_KEY}`,
      { cache: "no-store" }
    );

    if (!response.ok) throw new Error(`News API error ${response.status}`);

    const data = await response.json();

    return (data.articles ?? []).map((article: any, index: number) => ({
      id: index.toString(),
      title: article.title,
      url: article.url,
      description: article.description,
      created_at: article.publishedAt,
      news_site: article.source?.name,
      thumbnail: article.urlToImage || "/placeholder.png",
    }));
  } catch (error) {
    console.error("Error fetching coin-specific news:", error);
    throw error;
  }
}
