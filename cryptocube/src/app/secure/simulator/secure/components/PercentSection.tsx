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
      <div 
        className="shadow-lg rounded-xl p-6"
        style={{ background: "var(--color-container-bg)" }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground-alt)" }}>
          {t("percent.title")}
        </h2>
        <p className="text-sm" style={{ color: "var(--foreground-grey)" }}>{t("percent.loading")}</p>
      </div>
    );
  }

  /*
    if loading is done but valueData is null, show an error
  */
  if (!valueData) {
    return (
      <div className="shadow-lg rounded-xl p-6" style={{ background: "var(--color-container-bg)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground-alt)' }}>
          {t("percent.title")}
        </h2>
        <p className="text-sm" style={{ color: "var(--color-error)" }}>{t("percent.error")}</p>
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
    <div className="shadow-lg rounded-xl p-6" style={{ background: "var(--color-container-bg)" }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground-alt)" }}>
        {t("percent.title")}
      </h2>

      {/* the three main boxes: portfolio value, unrealized pnl, total return */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* total portfolio value */}
        <div className="shadow-md rounded-lg px-4 py-3" style={{ backgroundColor: 'var(--simulator-wallet-coins)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-grey)' }}>
            {t("percent.metricTotalValue")}
          </p>
          <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            {formatUsd(portfolioValue)}
          </p>
        </div>

        {/* unrealized profit / loss */}
        <div className="shadow-md rounded-lg px-4 py-3" style={{ backgroundColor: 'var(--simulator-wallet-coins)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-grey)' }}>
            {t("percent.metricProfitLoss")}
          </p>
          <p
            className={"text-lg font-semibold "}
            style={{ color: unrealizedProfitLoss >= 0 ? "var(--color-green)" : "var(--color-red)" }}
          >
            {formatUsd(unrealizedProfitLoss)}
            <span className="text-sm" style={{ color: 'var(--foreground-grey)' }}>
              ({formatPercentage(unrealizedPercentage)})
            </span>
          </p>
        </div>

        {/* total return (realized + unrealized) */}
        <div className="shadow-md rounded-lg px-4 py-3" style={{ backgroundColor: 'var(--simulator-wallet-coins)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-grey)' }}>
            {t("percent.metricTotalReturn")}
          </p>
          <p
            className={"text-lg font-semibold "}
            style={{ color: totalReturnUsd >= 0 ? "var(--color-green)" : "var(--color-red)" }}
          >
            {formatUsd(totalReturnUsd)}
            <span className="text-sm" style={{ color: 'var(--foreground-grey)' }}>
              ({formatPercentage(totalReturnPercentage)})
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
