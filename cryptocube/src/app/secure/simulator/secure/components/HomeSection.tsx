"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PortfolioChart from "../../../components/Portfolio/PortfolioChart";

export default function HomeSection() {
  const { t } = useTranslation();

  // live valuation of the portfolio
  const [currentCashValue, setCurrentCashValue] = useState(0);
  const [currentPortfolioValue, setCurrentPortfolioValue] = useState(0);
  const [totalHoldingsCount, setTotalHoldingsCount] = useState(0);

  // orders lists
  const [pendingOrdersList, setPendingOrdersList] = useState<any[]>([]);
  const [executedOrdersList, setExecutedOrdersList] = useState<any[]>([]);

  // loading state
  const [isLoading, setIsLoading] = useState(true);

  /*
    when the component opens, we load: 
    - live simulator value (cash + holdings + portfolio value)
    - pending orders
    - executed orders
  */
  useEffect(() => {
    async function loadAllSimulatorData() {
      try {
        // fetch live value
        const valueResponse = await fetch("/api/simulator/value");
        const valueJson = await valueResponse.json();

        setCurrentCashValue(Number(valueJson.cash || 0));
        setCurrentPortfolioValue(Number(valueJson.portfolioValue || 0));

        // count the holdings
        const holdingsCount = Array.isArray(valueJson.holdings)
          ? valueJson.holdings.length
          : 0;
        setTotalHoldingsCount(holdingsCount);

        // fetch pending + executed orders at the same time
        const [pendingResponse, executedResponse] = await Promise.all([
          fetch("/api/simulator/orders/list/pending"),
          fetch("/api/simulator/orders/list/executed"),
        ]);

        const pendingJson = await pendingResponse.json();
        const executedJson = await executedResponse.json();

        // store the lists safely
        setPendingOrdersList(
          Array.isArray(pendingJson.orders) ? pendingJson.orders : []
        );
        setExecutedOrdersList(
          Array.isArray(executedJson.orders) ? executedJson.orders : []
        );
      } catch (error) {
        console.error("Failed to load simulator home section:", error);

        setCurrentCashValue(0);
        setCurrentPortfolioValue(0);
        setTotalHoldingsCount(0);

        setPendingOrdersList([]);
        setExecutedOrdersList([]);
      }

      setIsLoading(false);
    }

    loadAllSimulatorData();
  }, []);

  // simple helper to format any USD value
  function formatUsd(value: number) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-8 bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* overview header of the simulator */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-yellow-400">
          {t("simulator.overviewTitle")}
        </h2>

        {isLoading ? (
          <p className="text-slate-400 text-sm">{t("simulator.loadingData")}</p>
        ) : (
          <div className="grid grid-cols-4 gap-4 text-sm">

            {/* cash */}
            <div>
              <p className="text-slate-400">{t("simulator.cash")}</p>
              <p className="text-white font-semibold">
                {formatUsd(currentCashValue)}
              </p>
            </div>

            {/* available balance (same value for now, but we keep it separated) */}
            <div>
              <p className="text-slate-400">{t("simulator.availableBalance")}</p>
              <p className="text-white font-semibold">
                {formatUsd(currentCashValue)}
              </p>
            </div>

            {/* number of holdings */}
            <div>
              <p className="text-slate-400">{t("simulator.holdings")}</p>
              <p className="text-white font-semibold">{totalHoldingsCount}</p>
            </div>

            {/* total portfolio value */}
            <div>
              <p className="text-slate-400">{t("simulator.portfolioValue")}</p>
              <p className="text-white font-semibold">
                {formatUsd(currentPortfolioValue)}
              </p>
            </div>

          </div>
        )}
      </div>

      {/* title for the portfolio chart */}
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("simulator.portfolioValueTitle")}
      </h2>

      {/* the portfolio chart itself */}
      <PortfolioChart />
    </div>
  );
}
