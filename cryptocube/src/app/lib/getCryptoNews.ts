export async function getCryptoNews() {
  const response = await fetch("/api/home/news");

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = await response.json();
  return data.articles;
}
