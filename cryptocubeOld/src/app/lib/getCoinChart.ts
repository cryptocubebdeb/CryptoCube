const URL_API = "https://api.coingecko.com/api/v3";

export async function getCoinChart(
  id: string,
  days: number = 30,
  currency: string = "usd"
) {
  const API_KEY = process.env.COINGECKO_API_KEY;
  if (!API_KEY) {
    throw new Error("Missing COINGECKO_API_KEY in environment.");
  }

  const options = {
    method: "GET", headers: { "x-cg-demo-api-key": API_KEY },
};

  const url = `${URL_API}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`CoinGecko server error ${response.status}`);
    }

    const data = await response.json();

    const prices = Array.isArray(data.prices)
      ? data.prices.map(([time, price]: [number, number]) => ({
          time,
          price,
        }))
      : [];

    return prices;
  } catch (error) {
    console.error("Error fetching market chart:", error);
    throw error;
  }
}
