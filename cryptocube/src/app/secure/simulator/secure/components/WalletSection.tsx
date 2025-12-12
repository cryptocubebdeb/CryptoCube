"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import CircleChart from "./WalletChart";

// Structure of each coin the user owns
type coinHolding = {
  coinId: string;
  coinSymbol: string;
  amountOwned: number;
  currentValueUsd: number;
};

export default function WalletSection() {
  const { t: translator } = useTranslation();
  const router = useRouter();

  // cash available in USD
  const [cashBalance, setCashBalance] = useState(0);

  // list of coins the user owns
  const [portfolioHoldings, setPortfolioHoldings] = useState<coinHolding[]>([]);

  // images for each coin
  const [coinLogos, setCoinLogos] = useState<Record<string, string>>({});

  // loading indicator
  const [isLoading, setIsLoading] = useState(true);

  /*
    Fetch the wallet data: cash + holdings + live valuation.
  */
  useEffect(() => {
    async function fetchWalletData() {
      try {
        const response = await fetch("/api/simulator/value");
        const jsonData = await response.json();

        setCashBalance(Number(jsonData.cash || 0));

        // make sure we only set the holdings if the API returns an array
        if (Array.isArray(jsonData.holdings)) {
          // sort the holdings by market value descending
          const sortedHoldings = [...jsonData.holdings].sort(
            (a, b) => b.currentValueUsd - a.currentValueUsd
          );

          setPortfolioHoldings(sortedHoldings);
        } else {
          setPortfolioHoldings([]);
        }
      } catch (error) {
        console.error("Error while loading wallet:", error);
        setCashBalance(0);
        setPortfolioHoldings([]);
      }

      setIsLoading(false);
    }

    fetchWalletData();
  }, []);

  /*
    Fetch the logos for each coin using the coinId.
    This runs as soon as portfolioHoldings is filled.
  */
  useEffect(() => {
    // if no holdings, skip
    if (portfolioHoldings.length === 0) return;

    async function fetchLogos() {
      const result: Record<string, string> = {};

      for (const holding of portfolioHoldings) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${holding.coinId}`
          );
          const data = await response.json();

          // store the small image when available
          result[holding.coinSymbol] = data.image?.small || "";
        } catch (error) {
          // if logo not available, fallback to empty
          result[holding.coinSymbol] = "";
        }
      }

      setCoinLogos(result);
    }

    fetchLogos();
  }, [portfolioHoldings]);

  // total value of the positions (coins only)
  const totalPortfolioValue = portfolioHoldings.reduce(
    (sum, item) => sum + item.currentValueUsd,
    0
  );

  // data passed to the circle chart component
  const chartData = portfolioHoldings.map((holding) => ({
    label: holding.coinSymbol,
    value: holding.currentValueUsd,
    id: holding.coinId,
  }));

  // when the user clicks a chart slice, we redirect to that coin
  function handleChartSliceClick(selectedSlice: any) {
    router.push(`/secure/specificCoin/${selectedSlice.id}`);
  }

  return (
    <div
      className="shadow-lg rounded-xl p-6"
      style={{ background: "var(--color-container-bg)" }}
    >

      {/* Title + Available Cash */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--foreground-alt)" }}>
          {translator("wallet.title")}
        </h2>

        <p className="text-sm" style={{ color: "var(--foreground-grey)" }}>
          {translator("wallet.availableCash")} {" "}
          <span style={{ color: "var(--foreground)" }}>${cashBalance.toFixed(2)}</span>
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <p style={{ color: "var(--foreground-grey)" }}>{translator("wallet.loading")}</p>
      )}

      {/* No holdings */}
      {!isLoading && portfolioHoldings.length === 0 && (
        <p style={{ color: "var(--foreground-grey)" }}>{translator("wallet.noHoldings")}</p>
      )}

      {/* Chart + List */}
      {!isLoading && portfolioHoldings.length > 0 && (
        <div className="flex gap-6">

          {/* Donut Chart */}
          <div className="w-1/2 flex justify-center items-center">
            <CircleChart data={chartData} onClick={handleChartSliceClick} />
          </div>

          {/* Coin List on the right */}
          <div className="w-1/2 space-y-2">
            {portfolioHoldings.map((holding) => (
              <div
                key={holding.coinId}
                className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer shadow-sm"
                style={{ background: "var(--simulator-wallet-coins)" }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--simulator-wallet-coins-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--simulator-wallet-coins)'}
                onClick={() =>
                  router.push(`/secure/specificCoin/${holding.coinId}`)
                }
              >

                {/* Left: image + coin symbol */}
                <div className="flex items-center gap-3">
                  <img
                    src={coinLogos[holding.coinSymbol]}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />

                  <div>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>{holding.coinSymbol}</p>

                    <p className="text-xs" style={{ color: "var(--foreground-grey)" }}>
                      {(
                        (holding.currentValueUsd / totalPortfolioValue) *
                        100
                      ).toFixed(1)}
                      % {translator("wallet.ofPortfolio")}
                    </p>
                  </div>
                </div>

                {/* Right: value + amount */}
                <div className="text-right">
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                    ${holding.currentValueUsd.toFixed(2)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--foreground-grey)" }}>
                    {holding.amountOwned.toFixed(6)}
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
