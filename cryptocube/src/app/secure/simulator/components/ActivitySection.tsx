"use client";

import { useEffect, useMemo, useState } from "react";

// Define the structure of a trade
type Trade = {
  id: number;
  coinSymbol: string;
  orderType: "BUY" | "SELL";       // Side of the order
  orderKind: "MARKET" | "LIMIT";   // Type of order
  amount: string | number;          // Amount of coins traded
  price: string | number | null;    // Price specified in the order
  executedPrice?: string | number | null; // Price at which trade was actually executed
  executedAt: string;               // Timestamp of execution
};

// Filters for side and type
type SideFilter = "ALL" | "BUY" | "SELL";
type KindFilter = "ALL" | "MARKET" | "LIMIT";

export default function ActivitySection() {
  // Store all executed trades
  const [executedTrades, setExecutedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for the displayed list
  const [sideFilter, setSideFilter] = useState<SideFilter>("ALL");
  const [kindFilter, setKindFilter] = useState<KindFilter>("ALL");
  const [coinFilter, setCoinFilter] = useState<string>("ALL");

  // Load executed trades from the API when component mounts
  useEffect(() => {
    async function loadExecutedTrades() {
      try {
        const response = await fetch("/api/simulator/orders/list/executed");
        const data = await response.json();
        // Ensure we store an array even if API returns something unexpected
        setExecutedTrades(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        console.error("Failed to load executed trades:", err);
        setExecutedTrades([]);
      } finally {
        setLoading(false);
      }
    }

    loadExecutedTrades();
  }, []);

  // Generate a list of unique coins for the dropdown filter
  const coinOptions = useMemo(() => {
    const symbols = Array.from(new Set(executedTrades.map((t) => t.coinSymbol))).sort();
    return ["ALL", ...symbols];
  }, [executedTrades]);

  // Apply all selected filters to the executed trades
  const filteredTrades = useMemo(() => {
    return executedTrades.filter((trade) => {
      if (sideFilter !== "ALL" && trade.orderType !== sideFilter) return false;
      if (kindFilter !== "ALL" && trade.orderKind !== kindFilter) return false;
      if (coinFilter !== "ALL" && trade.coinSymbol !== coinFilter) return false;
      return true;
    });
  }, [executedTrades, sideFilter, kindFilter, coinFilter]);

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      {/* Header and filter controls */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold text-yellow-400">Trade History</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Side filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Side:</span>
            <div className="flex rounded-lg overflow-hidden border border-[#23252c]">
              {(["ALL", "BUY", "SELL"] as SideFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setSideFilter(value)}
                  className={`px-2 py-1 ${
                    sideFilter === value
                      ? "bg-yellow-400 text-black"
                      : "bg-[#15171f] text-slate-300 hover:bg-[#1b1e26]"
                  }`}
                >
                  {value === "ALL" ? "All" : value}
                </button>
              ))}
            </div>
          </div>

          {/* Kind filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Type:</span>
            <div className="flex rounded-lg overflow-hidden border border-[#23252c]">
              {(["ALL", "MARKET", "LIMIT"] as KindFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setKindFilter(value)}
                  className={`px-2 py-1 ${
                    kindFilter === value
                      ? "bg-yellow-400 text-black"
                      : "bg-[#15171f] text-slate-300 hover:bg-[#1b1e26]"
                  }`}
                >
                  {value === "ALL" ? "All" : value.charAt(0) + value.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Coin filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Coin:</span>
            <select
              value={coinFilter}
              onChange={(e) => setCoinFilter(e.target.value)}
              className="bg-[#15171f] border border-[#23252c] text-slate-200 px-2 py-1 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
            >
              {coinOptions.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol === "ALL" ? "All" : symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && <p className="text-slate-400 text-sm">Loading trade history…</p>}

      {/* Empty state */}
      {!loading && filteredTrades.length === 0 && (
        <p className="text-slate-500 text-sm">
          {executedTrades.length === 0
            ? "No executed trades yet."
            : "No trades match the current filters."}
        </p>
      )}

      {/* Scrollable list of trades */}
      {!loading && filteredTrades.length > 0 && (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
          {filteredTrades.map((trade) => {
            const executedPrice = Number(trade.executedPrice ?? trade.price ?? 0);
            const amount = Number(trade.amount ?? 0);
            const total = executedPrice * amount;
            const isBuy = trade.orderType === "BUY";

            return (
              <div
                key={trade.id}
                className="flex items-center justify-between bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3"
              >
                {/* Left side: trade details */}
                <div>
                  <p className={`font-semibold ${isBuy ? "text-green-400" : "text-red-400"}`}>
                    {isBuy ? "BUY" : "SELL"} {trade.coinSymbol}
                  </p>

                  <p className="text-xs text-slate-400">
                    {trade.orderKind === "MARKET"
                      ? "Market order"
                      : `Limit @ $${Number(trade.price ?? 0).toFixed(2)}`}
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {amount.toFixed(6)} @ ${executedPrice.toFixed(2)}
                  </p>

                  <p className="text-xs text-slate-500">
                    Total: ${total.toFixed(2)}
                  </p>
                </div>

                {/* Right side: execution timestamp */}
                <div className="text-right text-xs text-slate-400">
                  {trade.executedAt ? new Date(trade.executedAt).toLocaleString() : "-"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
