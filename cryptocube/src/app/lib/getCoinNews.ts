export async function getCoinNews(coinQuery: string) {
  if (!coinQuery) return [];

  const response = await fetch(
    `/api/home/coin-news?coin=${encodeURIComponent(coinQuery)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    console.error("Failed to fetch coin news");
    return [];
  }

  const data = await response.json();
  return Array.isArray(data.articles) ? data.articles : [];
}
