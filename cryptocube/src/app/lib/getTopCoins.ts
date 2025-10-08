const URL_API = "https://api.coingecko.com/api/v3";

export async function getTopCoins()
{
    const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (!API_KEY) {
        throw new Error("Missing NEXT_PUBLIC_COINGECKO_API_KEY in environment.");
    }

    const options = {
        method: "GET",
        headers: { "x-cg-demo-api-key": API_KEY, },
    };

    try {
        const response = await fetch(
            `${URL_API}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10&page=1`,
            options
        );

        if (!response.ok) {
            throw new Error(`CoinGecko server error ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching top coins:", error);
        throw error;
    }
}