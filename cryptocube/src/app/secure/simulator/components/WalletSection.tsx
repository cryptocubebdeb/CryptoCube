"use client";

import { useEffect, useState } from "react";
import { PortfolioItem } from "@/app/api/simulator/simulatorTypes";

/*
  This section shows the user's wallet:
    - cash balance
    - list of coins they own
*/

export default function WalletSection() {
  // Coins the user owns
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Cash amount
  const [cashBalance, setCashBalance] = useState(0);

  // Show loading message while we fetch data
  const [loading, setLoading] = useState(true);

  // Load wallet + cash from backend
  useEffect(() => {
    async function loadWallet() {
      try {
        const response = await fetch("/api/simulator/getPortfolio");
        const data = await response.json();

        // Always store an array
        setPortfolio(Array.isArray(data.portfolio) ? data.portfolio : []);

        // Ensure cash is a number
        setCashBalance(Number(data.currentCash || 0));
      } catch (err) {
        console.error("Failed to load wallet:", err);
        setPortfolio([]);
        setCashBalance(0);
      }

      setLoading(false);
    }

    loadWallet();
  }, []);

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-yellow-400">Wallet</h2>

        <p className="text-sm text-slate-400">
          Cash:{" "}
          <span className="text-white">${cashBalance.toFixed(2)}</span>
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <p className="text-slate-400 text-sm">Loading portfolio…</p>
      )}

      {/* Empty state */}
      {!loading && portfolio.length === 0 && (
        <p className="text-slate-500 text-sm">No holdings yet.</p>
      )}

      {/* Holdings list */}
      {!loading && portfolio.length > 0 && (
        <div className="space-y-2">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3"
            >
              {/* Coin info */}
              <div>
                <p className="font-semibold text-white">
                  {item.coinSymbol}
                </p>

                {/* Show average entry price */}
                <p className="text-xs text-slate-400">
                  Avg entry: $
                  {Number(item.averageEntryPriceUsd).toFixed(4)}
                </p>
              </div>

              {/* Amount owned */}
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {Number(item.amountOwned).toFixed(6)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
