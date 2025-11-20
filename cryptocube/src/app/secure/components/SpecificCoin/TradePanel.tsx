"use client";

import { useState } from "react";

export default function TradePanel({
    mode,          // "BUY" or "SELL"
    symbol,      
    coinId,
    price,
    logo,
    holding,       
    currentCash   
}) {
    // Which input mode the user is typing: CAD or CRYPTO
    const [inputMode, setInputMode] = useState<"FIAT" | "CRYPTO">("FIAT");

    // Text input value
    const [value, setValue] = useState("");

    // Loading state when placing order
    const [loading, setLoading] = useState(false);

    // User feedback message
    const [message, setMessage] = useState("");

    // Max values user can use
    const maxFiat = Number(currentCash ?? 0);
    const maxOwned = Number(holding?.amountOwned ?? 0);

    // Convert input to crypto amount
    const cryptoAmount = inputMode === "CRYPTO" ? Number(value) : Number(value) / price;

    // Convert input to fiat amount
    const fiatAmount = inputMode === "FIAT" ? Number(value) : Number(value) * price;

    // Fills the input with the maximum available value
    function fillMax() {
        if (mode === "BUY") {
            // BUY: max limited by money
            if (inputMode === "FIAT") {
                setValue(maxFiat.toString());
            } else {
                setValue((maxFiat / price).toFixed(6));
            }
        } else {
            // SELL: max limited by amount owned
            if (inputMode === "CRYPTO") {
                setValue(maxOwned.toString());
            } else {
                setValue((maxOwned * price).toFixed(2));
            }
        }
    }

    // Submit the order to backend
    async function submit() {
        setLoading(true);
        setMessage("");

        // Check if amount is valid
        if (!cryptoAmount || cryptoAmount <= 0) {
            setMessage("Enter a valid amount");
            setLoading(false);
            return;
        }

        // BUY checks
        if (mode === "BUY" && fiatAmount > currentCash) {
            setMessage("Not enough funds");
            setLoading(false);
            return;
        }

        // SELL checks
        if (mode === "SELL" && cryptoAmount > maxOwned) {
            setMessage("Not enough coins");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/simulator/orders/postOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coinId,
                    tradeSymbol: symbol.toUpperCase() + "USDT",
                    quantity: cryptoAmount,
                    orderKind: "limit",
                    orderSell: mode.toLowerCase(),
                    price: Number(price)
                })
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                setMessage(data.error);
                return;
            }

            // Success
            setMessage(`${mode} order placed`);
            setValue(""); // clear input
        } catch (err) {
            setMessage("Failed to place order");
            setLoading(false);
        }
    }

    return (
        <div className="p-3 bg-white/5 rounded-md space-y-3 text-sm">

            {/* Header */}
            <div className="flex items-center gap-2">
                {logo && <img src={logo} className="w-5 h-5 rounded" />}
                <span className="text-white font-semibold">
                    {mode} {symbol}
                </span>
            </div>

            {/* CAD / CRYPTO toggle */}
            <div className="flex gap-2 text-xs">
                <button
                    onClick={() => setInputMode("FIAT")}
                    className={`flex-1 py-1 rounded ${
                        inputMode === "FIAT" ? "bg-yellow-400 text-black" : "bg-white/10 text-white/60"}`}
                > CAD </button>

                <button
                    onClick={() => setInputMode("CRYPTO")}
                    className={`flex-1 py-1 rounded ${
                        inputMode === "CRYPTO" ? "bg-yellow-400 text-black" : "bg-white/10 text-white/60"
                    }`}
                > {symbol} </button>
            </div>

            {/* Amount input */}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={
                        inputMode === "FIAT" ? "Amount in CAD" : `Amount in ${symbol}` }
                    className="w-full p-2 rounded bg-black/30 border border-white/20 text-white text-sm"
                />

                <button
                    onClick={fillMax}
                    className="px-3 py-1 bg-white/10 text-white/70 hover:bg-white/20 text-xs rounded"
                > MAX </button>
            </div>

            {/* Conversion display */}
            <div className="text-white/60 text-xs">
                {inputMode === "FIAT" ? `≈ ${cryptoAmount.toFixed(6)} ${symbol}` : `≈ $${fiatAmount.toFixed(2)} CAD`}
            </div>

            {/* Submit */}
            <button
                onClick={submit}
                disabled={loading}
                className="w-full py-1.5 bg-yellow-400 text-black rounded font-semibold text-xs hover:bg-yellow-300 disabled:opacity-50"
            >
                {loading ? "Processing..." : `${mode} ${symbol}`}
            </button>

            {/* Message */}
            {message && (
                <p className="text-white/70 text-xs">{message}</p>
            )}
        </div>
    );
}
