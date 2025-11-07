const URL_API = "https://api.coingecko.com/api/v3";

export async function getCoin(id: string) {
    if (!id) {
        console.warn("[getCoin] No id provided");
        return null;
    }
    
    const API_KEY = process.env.COINGECKO_API_KEY;
    if (!API_KEY) {
        throw new Error("Missing COINGECKO_API_KEY in environment.");
    }
    const options = {
        method: "GET", headers: { "x-cg-demo-api-key": API_KEY },
    };
    const url = `${URL_API}/coins/${id}`;

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`CoinGecko server error ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching coin:", error);
        throw error;
    }
}
