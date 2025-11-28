export async function getBinanceTopBook() {
    try {
        const res = await fetch(
            "https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5",
            { cache: "no-store" }  // prevent caching
        );

        if (!res.ok) {
            throw new Error("Failed to fetch Binance order book");
        }

        const data = await res.json();

        return {
            bids: data.bids.map(([price, qty]: [string, string]) => ({
                price,
                qty,
            })),
            asks: data.asks.map(([price, qty]: [string, string]) => ({
                price,
                qty,
            })),
        };
    } catch (err) {
        console.error("Error in getBinanceTopBook:", err);
        return {
            bids: [{ price: "0", qty: "0" }],
            asks: [{ price: "0", qty: "0" }],
        };
    }
}
