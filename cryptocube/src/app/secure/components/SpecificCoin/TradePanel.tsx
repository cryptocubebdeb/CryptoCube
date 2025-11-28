"use client";

import { useState } from "react";
import Image from "next/image";

export default function TradePanel({
    mode,          // "BUY" or "SELL"
    symbol,        // ex: BTC
    coinId,        // ex: bitcoin
    price,         // live market price
    logo,          // coin image
    holding,       // user holding for this coin
    currentCash,   // cash from simulator
}) {
    // UI state
    const [orderKind, setOrderKind] = useState<"MARKET" | "LIMIT">("MARKET");
    const [inputValue, setInputValue] = useState(""); 
    const [limitPrice, setLimitPrice] = useState("");
    const [inputMode, setInputMode] = useState<"FIAT" | "CRYPTO">("FIAT");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Price used for the calculation (limit or market)
    const limitPriceNumber = Number(limitPrice);
    const effectivePrice =
        orderKind === "LIMIT" && limitPriceNumber > 0
            ? limitPriceNumber
            : price;

    // Convert between fiat and crypto
    const cryptoAmount =
        inputMode === "CRYPTO"
            ? Number(inputValue || 0)
            : effectivePrice > 0
                ? Number(inputValue || 0) / effectivePrice
                : 0;

    const fiatAmount =
        inputMode === "FIAT"
            ? Number(inputValue || 0)
            : Number(inputValue || 0) * effectivePrice;

    // MAX button logic based on buy/sell + input mode
    function handleMax() {
        const amountOwned = Number(holding?.amountOwned || 0);

        if (mode === "BUY") {
            if (inputMode === "FIAT") {
                setInputValue(currentCash.toString());
            } else {
                const maxCrypto =
                    effectivePrice > 0 ? currentCash / effectivePrice : 0;
                setInputValue(maxCrypto.toFixed(6));
            }
        } else {
            if (inputMode === "CRYPTO") {
                setInputValue(amountOwned.toString());
            } else {
                setInputValue((amountOwned * effectivePrice).toFixed(2));
            }
        }
    }

    // Submit final order
    async function submitOrder() {
        setSubmitting(true);
        setMessage("");

        if (!inputValue || Number(inputValue) <= 0) {
            setMessage("Enter a valid amount.");
            setSubmitting(false);
            return;
        }

        if (cryptoAmount <= 0) {
            setMessage("Amount too small.");
            setSubmitting(false);
            return;
        }

        if (orderKind === "LIMIT" && (!limitPrice || limitPriceNumber <= 0)) {
            setMessage("Enter a valid limit price.");
            setSubmitting(false);
            return;
        }

        if (mode === "BUY") {
            const requiredCash = cryptoAmount * effectivePrice;
            if (requiredCash > currentCash) {
                setMessage("Not enough cash.");
                setSubmitting(false);
                return;
            }
        }

        if (mode === "SELL") {
            const amountOwned = Number(holding?.amountOwned || 0);
            if (cryptoAmount > amountOwned) {
                setMessage("Not enough coins.");
                setSubmitting(false);
                return;
            }
        }

        try {
            // shape of the payload (same structure as side panel)
            const requestBody = {
                coinId,
                coinSymbol: symbol.toUpperCase(),
                amount: cryptoAmount,
                orderType: mode,
                orderKind,
                price: orderKind === "LIMIT" ? limitPriceNumber : null,
            };

            const response = await fetch("/api/simulator/orders/list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || "Order failed.");
            } else {
                setMessage(`${orderKind} ${mode} order placed.`);
                setInputValue("");
                if (orderKind === "MARKET") setLimitPrice("");
            }
        } catch {
            setMessage("Network error.");
        } finally {
            setSubmitting(false);
        }
    }

    // Render panel
    return (
        <div className="bg-[#0e1117] border border-white/10 p-4 rounded-lg text-white space-y-4">

            {/* Header */}
            <div className="flex items-center gap-3">
                {logo && (
                    <Image
                        src={logo}
                        alt="coin logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                )}
                <h3 className="text-lg font-semibold">
                    {mode} {symbol.toUpperCase()}
                </h3>
            </div>

            {/* Market / Limit selection */}
            <div className="flex bg-white/5 rounded-md overflow-hidden">
                {["MARKET", "LIMIT"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setOrderKind(type as any)}
                        className={`flex-1 py-2 text-sm font-semibold ${
                            orderKind === type
                                ? "bg-yellow-400 text-black"
                                : "text-white/60 hover:bg-white/10"
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Limit price input */}
            {orderKind === "LIMIT" && (
                <input
                    type="text"
                    inputMode="decimal"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Limit price"
                    className="w-full bg-[#0e1117] border border-white/20 rounded-md px-3 py-2 text-sm"
                />
            )}

            {/* Amount input */}
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-white/40 uppercase">
                    {inputMode === "FIAT" ? "FIAT" : symbol.toUpperCase()}
                </span>

                <input
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-center text-4xl font-semibold outline-none w-full py-2"
                />
            </div>

            {/* Max button */}
            <div className="flex justify-center">
                <button
                    onClick={handleMax}
                    className="px-3 py-1 bg-white/10 rounded-md text-xs"
                >
                    MAX
                </button>
            </div>

            {/* Input mode (fiat / crypto) */}
            <div className="flex gap-2">
                <button
                    onClick={() => setInputMode("FIAT")}
                    className={`flex-1 py-2 text-sm rounded-md ${
                        inputMode === "FIAT"
                            ? "bg-yellow-400 text-black"
                            : "bg-white/10 text-white/60"
                    }`}
                >
                    Fiat
                </button>

                <button
                    onClick={() => setInputMode("CRYPTO")}
                    className={`flex-1 py-2 text-sm rounded-md ${
                        inputMode === "CRYPTO"
                            ? "bg-yellow-400 text-black"
                            : "bg-white/10 text-white/60"
                    }`}
                >
                    {symbol.toUpperCase()}
                </button>
            </div>

            {/* Conversion preview */}
            <p className="text-center text-xs text-white/50">
                {inputMode === "FIAT"
                    ? `≈ ${cryptoAmount.toFixed(6)} ${symbol}`
                    : `≈ $${fiatAmount.toFixed(2)}`}
            </p>

            {/* Submit button */}
            <button
                onClick={submitOrder}
                disabled={submitting}
                className="w-full py-2 bg-yellow-400 text-black font-semibold rounded-md disabled:opacity-50"
            >
                {submitting ? "Sending…" : `${mode} ${symbol}`}
            </button>

            {/* Status message */}
            {message && (
                <p className="text-xs text-center text-yellow-300 mt-1">
                    {message}
                </p>
            )}
        </div>
    );
}
