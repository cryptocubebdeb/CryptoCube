export async function getCoinNews(coin: string, limit = 10) {
  if (!coin) return [];

  const response = await fetch(
    `/api/home/coinNews?coin=${encodeURIComponent(coin)}&limit=${limit}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    console.error("Failed to fetch coin news");
    return [];
  }

  const data = await response.json();
  return Array.isArray(data.articles) ? data.articles : [];
}
