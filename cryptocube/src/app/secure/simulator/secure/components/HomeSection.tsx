"use client";

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import PortfolioChart from "../../../components/Portfolio/PortfolioChart";

export default function HomeSection() {
  const { t } = useTranslation();
  // Store user's current cash balance
  const [cash, setCash] = useState(0);

  // Store user's coin holdings
  const [holdings, setHoldings] = useState<any[]>([]);

  // Store pending orders (submitted but not executed)
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  // Store executed orders (already completed trades)
  const [executedOrders, setExecutedOrders] = useState<any[]>([]);

  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Load portfolio, pending orders, and executed orders on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all three API endpoints in parallel for efficiency
        const [portfolioRes, pendingRes, executedRes] = await Promise.all([
          fetch("/api/simulator/portfolio"),
          fetch("/api/simulator/orders/list/pending"),
          fetch("/api/simulator/orders/list/executed"),
        ]);

        // Parse JSON responses
        const portfolioData = await portfolioRes.json();
        const pendingData = await pendingRes.json();
        const executedData = await executedRes.json();

        // Set state values safely
        setCash(Number(portfolioData.cash || 0));
        setHoldings(Array.isArray(portfolioData.holdings) ? portfolioData.holdings : []);

        setPendingOrders(Array.isArray(pendingData.orders) ? pendingData.orders : []);
        setExecutedOrders(Array.isArray(executedData.orders) ? executedData.orders : []);
      } catch (err) {
        // If API fails, reset all state to defaults and log the error
        console.error("Failed to load home data:", err);
        setCash(0);
        setHoldings([]);
        setPendingOrders([]);
        setExecutedOrders([]);
      }

      // Mark loading as complete
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* ================= Header Overview ================= */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-yellow-400">{t('simulator.overviewTitle')}</h2>

        {loading ? (
          // Display loading text while fetching data
          <p className="text-slate-400 text-sm">{t('simulator.loadingData')}</p>
        ) : (
          // Display summary of key portfolio information
          <div className="grid grid-cols-3 gap-4 text-sm">

            {/* Cash Balance */}
            <div>
              <p className="text-slate-400">{t('simulator.cash')}</p>
              <p className="text-white font-semibold">${cash.toFixed(2)}</p>
            </div>

            {/* Number of Coin Holdings */}
            <div>
              <p className="text-slate-400">{t('simulator.holdings')}</p>
              <p className="text-white font-semibold">{holdings.length}</p>
            </div>

            {/* Number of Pending Orders */}
            <div>
              <p className="text-slate-400">{t('simulator.pendingOrders')}</p>
              <p className="text-white font-semibold">{pendingOrders.length}</p>
            </div>

          </div>
        )}
      </div>

      {/* ================= Portfolio Chart ================= */}
      {/* Displays a visual chart of user's portfolio holdings */}
      <h2 className="text-2xl font-semibold mb-6 text-center">
          Portfolio Value Over Time
      </h2>
      <PortfolioChart />
    </div>
  );
}
