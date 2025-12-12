"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// this is what the API returns when we call /api/simulator/value
type ValueApiResponse = {
  cash: number;
  investedCapital: number;
  positionsValue: number;
  portfolioValue: number;
  unrealizedPnl: number;
  unrealizedPct: number;
  totalReturnUsd: number;
  totalReturnPct: number;
  realizedProfitUsd: number;
};

export default function PercentSection() {
  const { t } = useTranslation();

  // loading state while we fetch the API
  const [isLoading, setIsLoading] = useState(true);

  // this will store all values returned by /api/simulator/value
  const [valueData, setValueData] = useState<ValueApiResponse | null>(null);

  /*
    when the component opens, we fetch the valuation data.
    if it fails, we simply set valueData to null.
  */
  useEffect(() => {
    async function loadValueData() {
      try {
        const response = await fetch("/api/simulator/value");

        if (!response.ok) {
          console.error("Failed to load simulator valuation.");
          setValueData(null);
        } else {
          const json = await response.json();
          setValueData(json);
        }
      } catch (error) {
        console.error("Error while loading valuation:", error);
        setValueData(null);
      }

      setIsLoading(false);
    }

    loadValueData();
  }, []);

  // helper to format values as USD
  function formatUsd(numberValue: number) {
    return `$${numberValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  }

  // helper to format percentages
  function formatPercentage(numberValue: number) {
    const sign = numberValue >= 0 ? "+" : "";
    return `${sign}${numberValue.toFixed(2)}%`;
  }

  /*
    display while loading
  */
  if (isLoading) {
    return (
      <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">
          {t("percent.title")}
        </h2>
        <p className="text-sm text-slate-400">{t("percent.loading")}</p>
      </div>
    );
  }

  /*
    if loading is done but valueData is null, show an error
  */
  if (!valueData) {
    return (
      <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">
          {t("percent.title")}
        </h2>
        <p className="text-sm text-red-400">Failed to load performance data.</p>
      </div>
    );
  }

  /*
    extract useful values
  */
  const portfolioValue = valueData.portfolioValue;
  const unrealizedProfitLoss = valueData.unrealizedPnl;
  const unrealizedPercentage = valueData.unrealizedPct;
  const totalReturnUsd = valueData.totalReturnUsd;
  const totalReturnPercentage = valueData.totalReturnPct;

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        {t("percent.title")}
      </h2>

      {/* the three main boxes: portfolio value, unrealized pnl, total return */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* total portfolio value */}
        <div className="bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">
            {t("percent.metricTotalValue")}
          </p>
          <p className="text-lg font-semibold text-white">
            {formatUsd(portfolioValue)}
          </p>
        </div>

        {/* unrealized profit / loss */}
        <div className="bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">
            {t("percent.metricProfitLoss")}
          </p>
          <p
            className={
              "text-lg font-semibold " +
              (unrealizedProfitLoss >= 0 ? "text-emerald-400" : "text-red-400")
            }
          >
            {formatUsd(unrealizedProfitLoss)}
            <span className="text-sm text-slate-400 ml-1">
              ({formatPercentage(unrealizedPercentage)})
            </span>
          </p>
        </div>

        {/* total return (realized + unrealized) */}
        <div className="bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">
            {t("percent.metricTotalReturn")}
          </p>
          <p
            className={
              "text-lg font-semibold " +
              (totalReturnUsd >= 0 ? "text-emerald-400" : "text-red-400")
            }
          >
            {formatUsd(totalReturnUsd)}
            <span className="text-sm text-slate-400 ml-1">
              ({formatPercentage(totalReturnPercentage)})
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
