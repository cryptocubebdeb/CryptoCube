"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/*
  This structure describes one executed trade.
*/
type Trade = {
  id: number;
  coinSymbol: string;
  orderType: "BUY" | "SELL";           // This tells if the trade was a buy or a sell
  orderKind: "MARKET" | "LIMIT";       // This tells the type of order used
  amount: string | number;             // Amount of coins traded
  price: string | number | null;       // Limit price if it was a limit order
  executedPrice?: string | number | null; // Real executed price (only known after execution)
  executedAt: string;                  // Execution timestamp (from API)
};

/*
  Filters the user can apply to the list.
  "ALL" simply means no filter applied.
*/
type SideFilter = "ALL" | "BUY" | "SELL";
type KindFilter = "ALL" | "MARKET" | "LIMIT";

export default function ActivitySection() {
  const { t } = useTranslation();

  // This stores all executed trades coming from the backend
  const [executedTrades, setExecutedTrades] = useState<Trade[]>([]);

  // Loading state while we fetch from the API
  const [loading, setLoading] = useState(true);

  // Filters selected by the user
  const [sideFilter, setSideFilter] = useState<SideFilter>("ALL");
  const [kindFilter, setKindFilter] = useState<KindFilter>("ALL");
  const [coinFilter, setCoinFilter] = useState<string>("ALL");

  /*
    When the component loads, we fetch the executed trades.
    We wrap the API call in try/catch to handle any network failure cleanly.
  */
  useEffect(() => {
    async function loadExecutedTrades() {
      try {
        const response = await fetch("/api/simulator/orders/list/executed");
        const data = await response.json();

        // We store an array safely even if API is not perfect
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

  /*
    This generates a list of unique coin symbols to show in the dropdown filter.
    Example: ["ALL", "BTC", "ETH", "SOL"]
  */
  const coinOptions = useMemo(() => {
    const symbols = Array.from(
      new Set(executedTrades.map((trade) => trade.coinSymbol))
    ).sort();

    return ["ALL", ...symbols];
  }, [executedTrades]);

  /*
    Apply all filters.
    We pass through every trade and keep only the ones that match.
  */
  const filteredTrades = useMemo(() => {
    return executedTrades.filter((trade) => {
      if (sideFilter !== "ALL" && trade.orderType !== sideFilter) return false;
      if (kindFilter !== "ALL" && trade.orderKind !== kindFilter) return false;
      if (coinFilter !== "ALL" && trade.coinSymbol !== coinFilter) return false;
      return true;
    });
  }, [executedTrades, sideFilter, kindFilter, coinFilter]);

  return (
    <div className="shadow-lg rounded-xl p-6" style={{ backgroundColor: 'var(--color-container-bg)' }}>
      {/* Header section with filters */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground-alt)' }}>
          {t("activity.title")}
        </h2>

        {/* All filter controls grouped together */}
        <div className="flex flex-wrap items-center gap-2 text-xs">

          {/* Filter for BUY / SELL / ALL */}
          <div className="flex items-center gap-1">
            <span style={{ color: 'var(--foreground-grey)', fontSize: '0.95rem' }}>{t("activity.side")}</span>

            <div className="flex rounded-lg overflow-hidden shadow-sm">
              {(["ALL", "BUY", "SELL"] as SideFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setSideFilter(value)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 0,
                    fontSize: '0.95rem',
                    background: sideFilter === value ? 'var(--foreground-alt)' : 'var(--auth-background)',
                    color: sideFilter === value ? 'var(--background)' : 'var(--foreground-grey)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                    fontWeight: sideFilter === value ? 700 : 400,
                    boxShadow: sideFilter === value ? '0 1px 6px 0 rgba(0,0,0,0.10)' : undefined,
                  }}
                  onMouseOver={e => {
                    if (sideFilter !== value) e.currentTarget.style.background = 'var(--chart-range-hover)';
                  }}
                  onMouseOut={e => {
                    if (sideFilter !== value) e.currentTarget.style.background = 'var(--auth-background)';
                  }}
                >
                  {value === "ALL"
                    ? t("activity.all")
                    : value === "BUY"
                    ? t("activity.buy")
                    : t("activity.sell")}
                </button>
              ))}
            </div>
          </div>

          {/* Filter for MARKET / LIMIT / ALL */}
          <div className="flex items-center gap-1">
            <span style={{ color: 'var(--foreground-grey)', fontSize: '0.95rem' }}>{t("activity.type")}</span>

            <div className="flex rounded-lg overflow-hidden border border-[#23252c]">
              {(["ALL", "MARKET", "LIMIT"] as KindFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setKindFilter(value)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 0,
                    fontSize: '0.95rem',
                    background: kindFilter === value ? 'var(--foreground-alt)' : 'var(--auth-background)',
                    color: kindFilter === value ? 'var(--background)' : 'var(--foreground-grey)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                    fontWeight: kindFilter === value ? 700 : 400,
                    boxShadow: kindFilter === value ? '0 1px 6px 0 rgba(0,0,0,0.10)' : undefined,
                  }}
                  onMouseOver={e => {
                    if (kindFilter !== value) e.currentTarget.style.background = 'var(--chart-range-hover)';
                  }}
                  onMouseOut={e => {
                    if (kindFilter !== value) e.currentTarget.style.background = 'var(--auth-background)';
                  }}
                >
                  {value === "ALL"
                    ? t("activity.all")
                    : value === "MARKET"
                    ? t("activity.market")
                    : t("activity.limit")}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by coin */}
          <div className="flex items-center gap-1">
            <span style={{ color: 'var(--foreground-grey)', fontSize: '0.95rem' }}>{t("activity.coin")}</span>

            <select
              value={coinFilter}
              onChange={(e) => setCoinFilter(e.target.value)}
              className="border border-[#23252c] text-slate-200 px-2 py-1 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
              style={{ backgroundColor: 'var(--simulator-wallet-coins)', color: 'var(--foreground-grey)' }}
            >
              {coinOptions.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol === "ALL" ? t("activity.all") : symbol}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Display while loading */}
      {loading && (
        <p className="text-slate-400 text-sm">{t("activity.loading")}</p>
      )}

      {/* When no trades match the filters */}
      {!loading && filteredTrades.length === 0 && (
        <p className="text-slate-500 text-sm">
          {executedTrades.length === 0
            ? t("activity.noExecutedTrades")
            : t("activity.noMatchingTrades")}
        </p>
      )}

      {/* Display the list when we have trades */}
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
                {/* Left side contains all trade details */}
                <div>
                  <p
                    className={`font-semibold ${
                      isBuy ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isBuy
                      ? t("activity.buy").toUpperCase()
                      : t("activity.sell").toUpperCase()}{" "}
                    {trade.coinSymbol}
                  </p>

                  <p className="text-xs text-slate-400">
                    {trade.orderKind === "MARKET"
                      ? t("activity.marketOrder")
                      : t("activity.limitAt", {
                          price: Number(trade.price ?? 0).toFixed(2),
                        })}
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {amount.toFixed(6)} @ ${executedPrice.toFixed(2)}
                  </p>

                  <p className="text-xs text-slate-500">
                    {t("activity.total", { total: total.toFixed(2) })}
                  </p>
                </div>

                {/* Right side only shows the timestamp */}
                <div className="text-right text-xs text-slate-400">
                  {trade.executedAt
                    ? new Date(trade.executedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
