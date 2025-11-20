"use client";

import { useState } from "react";

export default function BuyBouton({ symbol, binanceSymbol }: { symbol: string; binanceSymbol: string | null }) {
    const [price, setPrice] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    if (!binanceSymbol) {
        return (
            <div className="p-4 border rounded">
                <p className="text-red-500 font-bold">
                    This coin is not traded on Binance.  
                    Simulator trading is disabled.
                </p>
            </div>
        );
    }

    const placeOrder = async () => {
        setLoading(true);
        setMessage("");

        const res = await fetch("/api/simulator/orders/postOrder", {
            method: "POST",
            body: JSON.stringify({
                symbol: binanceSymbol,
                price: Number(price),
                amount: Number(amount),
                orderType: "BUY"
            })
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setMessage("ERROR" + data.error);
            return;
        }

        setMessage("Order placed!");
        setPrice("");
        setAmount("");
    };

    return (
        <div className="p-4 border rounded space-y-3">
            <h2 className="font-bold text-lg">Buy {symbol.toUpperCase()}</h2>

            <div>
                <label className="block text-sm">Price</label>
                <input
                    className="w-full p-2 border rounded"
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm">Amount</label>
                <input
                    className="w-full p-2 border rounded"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
            </div>

            <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded"
            >
                {loading ? "Placing order..." : "Buy"}
            </button>

            {message && <p>{message}</p>}
        </div>
    );
}
