import WebSocket from "ws";
import { updateBinanceOrderBook } from "./updateInMemoryBinanceOrderBook.js";
import { matchLocalOrders } from "./matchPendingOrders.js";

/*
    This file creates one worker for each coin symbol.

    What a coin worker does:
        - Opens one WebSocket connection to Binance for that coin
        - Keeps an in-memory order book for bids and asks
        - It tries to match local pending orders
        - If the worker is manually stopped, the socket closes and never reconnects
*/
export function createSymbolWorker(symbol) {

    // If this is set to true, the worker stops reconnecting
    let workerStoppedManually = false;

    // This will hold the WebSocket connection
    let socketConnection = null;

    // Local in-memory book for this specific coin
    const localOrderBook = {
        bids: [],
        asks: []
    };

    /*
        To avoid hitting the database nonstop, we only run the matching function
        every certain amount of milliseconds.
    */
    let lastMatchTime = 0;
    const matchInterval = 150;

    function logMessage() {
        const args = Array.from(arguments);
        console.log("[" + symbol + "]", ...args);
    }

    /*
        This function creates a new WebSocket connection to Binance.
    */
    function connectToBinance() {

        // If the user manually stopped the worker, do not reconnect.
        if (workerStoppedManually) {
            return;
        }

        // Binance symbolformatting which is different from coin gecko symbols (always ends with USDT)
        let binanceSymbol = symbol.toUpperCase();
        if (!binanceSymbol.endsWith("USDT")) {
            binanceSymbol = binanceSymbol + "USDT";
        }

        const streamName = binanceSymbol.toLowerCase() + "@depth@100ms";
        const streamUrl = "wss://stream.binance.com:9443/ws/" + streamName;

        logMessage("Connecting to Binance depth stream...");
        socketConnection = new WebSocket(streamUrl);

        socketConnection.on("open", () => {
            logMessage("WebSocket connection opened.");
        });

        /*
            When Binance pushes an update message:
                - update our in-memory order book
                - run the matching function
        */
        socketConnection.on("message", async (rawData) => {

            try {
                const updateData = JSON.parse(rawData.toString());

                // Update the in-memory order book
                updateBinanceOrderBook(localOrderBook, updateData);

                // For debugging: Once every second, print the top-of-book.
                const currentTime = Date.now();
                if (!localOrderBook._debugUntil || currentTime > localOrderBook._debugUntil) {
                    const topBid = localOrderBook.bids[0]?.price;
                    const topAsk = localOrderBook.asks[0]?.price;
                    logMessage("TOP OF BOOK | bid=" + topBid + "  ask=" + topAsk);
                    localOrderBook._debugUntil = currentTime + 1000;
                }

                // Try to match local orders at a limited interval
                if (currentTime - lastMatchTime >= matchInterval) {
                    lastMatchTime = currentTime;

                    // Try to match local pending orders for this symbol
                    await matchLocalOrders(symbol, localOrderBook);
                }

            } catch (error) {
                logMessage("Error while processing WebSocket message:", error);
            }
        });

        /*
            If the WebSocket has an error, log it and close the socket.
            Closing the socket will then trigger reconnection logic below.
        */
        socketConnection.on("error", (error) => {
            logMessage("WebSocket error:", error);
            try {
                socketConnection.close();
            } catch {
                // ignore close errors
            }
        });

        /*
            When the WebSocket closes:
                - If it was manually stopped, do nothing.
                - If it closed from Binance, reconnect after two seconds.
        */
        socketConnection.on("close", () => {

            if (workerStoppedManually) {
                logMessage("Worker was closed manually.");
                return;
            }

            logMessage("WebSocket closed. Reconnecting in 2000 milliseconds...");
            setTimeout(connectToBinance, 2000);
        });
    }

    // Start the first connection
    connectToBinance();

    /*
        This function is returned so that the manager can call worker.stop()
        when there are no pending orders left for this coin.
    */
    return {
        stop() {
            workerStoppedManually = true;
            logMessage("Stopping worker.");

            try {
                socketConnection?.close();
            } catch {
                // ignore
            }
        }
    };
}
