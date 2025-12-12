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
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* Title + Available Cash */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-yellow-400">
          {translator("wallet.title")}
        </h2>

        <p className="text-sm text-slate-400">
          {translator("wallet.availableCash")}{" "}
          <span className="text-white">${cashBalance.toFixed(2)}</span>
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-slate-400">{translator("wallet.loading")}</p>
      )}

      {/* No holdings */}
      {!isLoading && portfolioHoldings.length === 0 && (
        <p className="text-slate-500">{translator("wallet.noHoldings")}</p>
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
                className="flex items-center justify-between bg-[#15171f] border border-[#23252c] px-4 py-3 rounded-lg cursor-pointer hover:bg-[#1b1e27]"
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
                    <p className="text-white font-semibold">{holding.coinSymbol}</p>

                    <p className="text-slate-400 text-xs">
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
                  <p className="text-white font-semibold">
                    ${holding.currentValueUsd.toFixed(2)}
                  </p>
                  <p className="text-slate-400 text-xs">
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
