"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Holding = {
  id: number;
  coinId: string;
  coinSymbol: string;
  amountOwned: number;
  averageEntryPriceUsd: number;
};

type PortfolioApiResponse = {
  cash: number;
  holdings: Holding[];
  realizedProfitUsd?: number;
};

export default function PercentSection() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [cash, setCash] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [realizedProfit, setRealizedProfit] = useState(0);

  const [currentValuePositions, setCurrentValuePositions] = useState(0);
  const [investedCapital, setInvestedCapital] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/simulator/portfolio");
        const data: PortfolioApiResponse = await res.json();

        setCash(Number(data.cash || 0));
        setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
        setRealizedProfit(Number(data.realizedProfitUsd || 0));
      } catch (err) {
        console.error("Failed to load portfolio", err);
        setCash(0);
        setHoldings([]);
        setRealizedProfit(0);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  useEffect(() => {
    if (!holdings.length) {
      setInvestedCapital(0);
      setCurrentValuePositions(0);
      setPriceLoading(false);
      return;
    }

    async function loadPrices() {
      setPriceLoading(true);
      try {
        const ids = holdings.map((h) => h.coinId).join(",");
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          ids
        )}&vs_currencies=usd`;

        const res = await fetch(url);
        const json: Record<string, { usd: number }> = await res.json();

        let invested = 0;
        let currentPositions = 0;

        for (const h of holdings) {
          const avg = Number(h.averageEntryPriceUsd) || 0;
          const amount = Number(h.amountOwned) || 0;
          const livePrice = json[h.coinId]?.usd ?? avg;

          invested += amount * avg;
          currentPositions += amount * livePrice;
        }

        setInvestedCapital(invested);
        setCurrentValuePositions(currentPositions);
      } catch (err) {
        console.error("Failed to load prices", err);

        // Fallback: treat current = cost basis
        let invested = 0;
        for (const h of holdings) {
          const avg = Number(h.averageEntryPriceUsd) || 0;
          const amount = Number(h.amountOwned) || 0;
          invested += amount * avg;
        }
        setInvestedCapital(invested);
        setCurrentValuePositions(invested);
      } finally {
        setPriceLoading(false);
      }
    }

    loadPrices();
  }, [holdings]);

  const portfolioValue = cash + currentValuePositions;
  const unrealizedPnl = currentValuePositions - investedCapital;
  const unrealizedPct = investedCapital > 0 ? (unrealizedPnl / investedCapital) * 100 : 0;

  const totalReturnUsd = realizedProfit + unrealizedPnl;
  const totalReturnPct =
    investedCapital > 0 ? (totalReturnUsd / investedCapital) * 100 : 0;

  const formatUsd = (v: number) =>
    `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const formatPct = (v: number) =>
    `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

  const loadingText = loading || priceLoading;

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      {/* Title */}
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        {t("percent.title")}
      </h2>

      {loadingText && (
        <p className="text-sm text-slate-400">{t("percent.loading") ?? "Loading performance..."}</p>
      )}

      {!loadingText && (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">
                {t("percent.metricTotalValue") ?? "Portfolio value"}
              </p>
              <p className="text-lg font-semibold text-white">
                {formatUsd(portfolioValue)}
              </p>
            </div>

            <div className="bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">
                {t("percent.metricProfitLoss") ?? "Unrealized P/L"}
              </p>
              <p
                className={
                  "text-lg font-semibold " +
                  (unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400")
                }
              >
                {formatUsd(unrealizedPnl)}{" "}
                <span className="text-sm text-slate-400 ml-1">
                  ({formatPct(unrealizedPct)})
                </span>
              </p>
            </div>

            <div className="bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">
                {t("percent.metricTotalReturn") ?? "Total return (realized + unrealized)"}
              </p>
              <p
                className={
                  "text-lg font-semibold " +
                  (totalReturnUsd >= 0 ? "text-emerald-400" : "text-red-400")
                }
              >
                {formatUsd(totalReturnUsd)}{" "}
                <span className="text-sm text-slate-400 ml-1">
                  ({formatPct(totalReturnPct)})
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
