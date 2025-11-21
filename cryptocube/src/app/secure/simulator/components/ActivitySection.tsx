"use client";

import { useEffect, useState } from "react";
import { TradeItem } from "@/app/api/simulator/simulatorTypes";

// Show the user's trade history 
export default function ActivitySection() {
  // List of trades
  const [trades, setTrades] = useState<TradeItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      try {
        const response = await fetch("/api/simulator/orders/getExecutedOrders");
        const data = await response.json();

        console.log("Loaded trades:", data);

        // Store all the trades in an arrays
        if (Array.isArray(data.trades)) {
          setTrades(data.trades as TradeItem[]);
        } else {
          setTrades([]); // fallback to an empty list
        }
      } catch (error) {
        console.error("Failed to load trade history:", error);
        setTrades([]);
      }

      setLoading(false);
    }

    loadTrades();
  }, []);

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">Trade History</h2>

      {/* If still loading */}
      {loading && (
        <p className="text-slate-400 text-sm">Loading trade history…</p>
      )}

      {/* If done loading but no trades */}
      {!loading && trades.length === 0 && (
        <p className="text-slate-500 text-sm">No trades yet.</p>
      )}

      {/* List trades */}
      {!loading && trades.length > 0 && (
        <div className="space-y-2">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3"
            >
              {/* Left side: trade details */}
              <div>
                <p className="font-semibold text-white">
                  {trade.tradeType} {trade.coinSymbol}
                </p>

                <p className="text-xs text-slate-400">
                  {Number(trade.amountTraded).toFixed(6)} • ${trade.tradePrice}
                </p>
              </div>

              {/* Right side: date */}
              <div className="text-right text-xs text-slate-400">
                {new Date(trade.executedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
