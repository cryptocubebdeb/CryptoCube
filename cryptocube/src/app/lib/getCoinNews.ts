export async function getCoinNews(coin: string) {
  const response = await fetch(`/api/home/coinNews?coin=${coin}`);

  if (!response.ok) return [];

  const data = await response.json();
  return data.articles;
}
