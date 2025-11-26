/*
    Updates our in-memory order book using Binance incremental depth updates.

    Binance does NOT resend the full order book.
    It only sends the price levels (bids or asks) that changed since the last message.

    Each update looks like:
        delta.b → list of BID changes
        delta.a → list of ASK changes

    Each entry is:
        [ "priceString", "quantityString" ]

    Binance order books are AGGREGATED:
        - If multiple traders place orders at the same price,
          Binance merges them into a single total quantity.

    Update rules:
        - If quantity === 0 → remove that price level entirely
        - If quantity > 0:
            • if the price exists, update its quantity
            • if it does not exist, insert it

    After applying updates:
        - bids must be sorted: highest price → lowest
        - asks must be sorted: lowest price → highest
*/
export function updateBinanceOrderBook(orderBook, delta) {

    // -------------------- HANDLE BID UPDATES (buyers) --------------------
    if (Array.isArray(delta.b)) {

        delta.b.forEach((update) => {

            const priceString = String(update[0]);
            const quantityNumber = Number(update[1]);

            // Find existing level (if any)
            const idx = orderBook.bids.findIndex(
                (level) => level.price === priceString
            );

            if (quantityNumber === 0) {
                // Remove this price level if it exists
                if (idx !== -1) orderBook.bids.splice(idx, 1);
            } else {
                // Insert or update the price level
                if (idx === -1) {
                    orderBook.bids.push({ price: priceString, qty: quantityNumber });
                } else {
                    orderBook.bids[idx].qty = quantityNumber;
                }
            }
        });

        // Bids → highest price first
        orderBook.bids.sort((a, b) => Number(b.price) - Number(a.price));
    }

    // -------------------- HANDLE ASK UPDATES (sellers) --------------------
    if (Array.isArray(delta.a)) {

        delta.a.forEach((update) => {

            const priceString = String(update[0]);
            const quantityNumber = Number(update[1]);

            // Find existing level (if any)
            const idx = orderBook.asks.findIndex(
                (level) => level.price === priceString
            );

            if (quantityNumber === 0) {
                // Remove this price level
                if (idx !== -1) orderBook.asks.splice(idx, 1);
            } else {
                // Insert or update
                if (idx === -1) {
                    orderBook.asks.push({ price: priceString, qty: quantityNumber });
                } else {
                    orderBook.asks[idx].qty = quantityNumber;
                }
            }
        });

        // Asks lowest price first
        orderBook.asks.sort((a, b) => Number(a.price) - Number(b.price));
    }
}
