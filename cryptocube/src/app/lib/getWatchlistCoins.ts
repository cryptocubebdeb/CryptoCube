const URL_API = "https://api.coingecko.com/api/v3";

export async function getWatchlistCoins(coinIds: string[]) {
    if (coinIds.length === 0) {
        return [];
    }

    const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    
    const options = API_KEY 
        ? {
            method: "GET",
            headers: { "x-cg-demo-api-key": API_KEY },
        }
        : {
            method: "GET",
        };

    try {
        const coinIdsParam = coinIds.join(',');
        const response = await fetch(
            `${URL_API}/coins/markets?vs_currency=usd&ids=${coinIdsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d&locale=fr`,
            options
        );

        if (!response.ok) {
            throw new Error(`CoinGecko server error ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching watchlist coins:", error);
        throw error;
    }
}
