"use client";

import { useState, useEffect } from "react";
import TradePanel from "./TradePanel";

export default function BuySection({ coinId, symbol, price, logo }) {
    // Which panel is open: BUY, SELL, or none
    const [openPanel, setOpenPanel] = useState<"BUY" | "SELL" | null>(null);

    // Info from the user's portfolio
    const [hasCoin, setHasCoin] = useState(false);
    const [userHolding, setUserHolding] = useState(null);
    const [cashBalance, setCashBalance] = useState(0);

    // When the coin changes, close the panel
    useEffect(() => {
        setOpenPanel(null);
    }, [symbol]);

    // Load the user's portfolio when the symbol changes
    useEffect(() => {
        async function fetchPortfolio() {
            const response = await fetch("/api/simulator/getPortfolio");
            const data = await response.json();

            if (data.error) return;

            // Find the coin in the portfolio (ex: ETHUSDT)
            const match = data.portfolio.find((item) => {
                return item.coinSymbol === symbol.toUpperCase() + "USDT";
            });

            // Save the info
            setUserHolding(match || null);

            if (match && Number(match.amountOwned) > 0) {
                setHasCoin(true);
            } else {
                setHasCoin(false);
            }

            setCashBalance(Number(data.currentCash || 0));
        }

        fetchPortfolio();
    }, [symbol]);

    // Buttons toggle logic
    function toggleBuy() {
        setOpenPanel(openPanel === "BUY" ? null : "BUY");
    }

    function toggleSell() {
        if (!hasCoin) return; // avoid opening sell if user owns nothing
        setOpenPanel(openPanel === "SELL" ? null : "SELL");
    }

    return (
        <div className="bg-[#0e1117] border border-yellow-400/30 rounded-lg p-3 w-full max-w-sm shadow-lg">
            <div className="flex gap-2">
                {/* BUY button */}
                <button
                    onClick={toggleBuy}
                    className={`flex-1 py-1.5 rounded-md text-sm font-semibold ${openPanel === "BUY"
                            ? "bg-yellow-400 text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                > BUY </button>

                {/* SELL button */}
                <button
                    disabled={!hasCoin}
                    onClick={toggleSell}
                    className={`flex-1 py-1.5 rounded-md text-sm font-semibold ${!hasCoin
                            ? "bg-white/5 text-white/30 cursor-not-allowed"
                            : openPanel === "SELL"
                                ? "bg-yellow-400 text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                > SELL </button>
            </div>

            {/* Only show the TradePanel if BUY or SELL is open */}
            {openPanel && (
                <div className="mt-3">
                    <TradePanel
                        mode={openPanel}
                        symbol={symbol}
                        coinId={coinId}
                        price={price}
                        logo={logo}
                        holding={userHolding}
                        currentCash={cashBalance}
                    />
                </div>
            )}
        </div>
    );
}
