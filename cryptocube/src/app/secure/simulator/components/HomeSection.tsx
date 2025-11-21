"use client";

import { useEffect, useState } from "react";
import PortfolioChart from "../../components/Portfolio/PortfolioChart";

// Import your TypeScript interfaces
import {
  PortfolioItem,
  PendingOrder,
  TradeItem
} from "@/app/api/simulator/simulatorTypes";

/*
  This is the HOME section of the simulator.
    - portfolio chart
    - cash balance
    - portfolio value (later)
    - number of pending + executed trades
*/

export default function HomeSection() {
  // Portfolio holdings
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Cash that the user has in the simulator
  const [cashBalance, setCashBalance] = useState(0);

  // Orders that are waiting to be executed
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  // Orders that have executed
  const [tradeHistory, setTradeHistory] = useState<TradeItem[]>([]);

  // Show loading while fetching data
  const [loading, setLoading] = useState(true);

  // Load all simulator data when the component appears
  useEffect(() => {
    async function loadData() {
      try {
        // Make all API calls at the same time
        const [portfolioRes, pendingRes, historyRes] = await Promise.all([
          fetch("/api/simulator/getPortfolio"),
          fetch("/api/simulator/orders/getPendingOrders"),
          fetch("/api/simulator/orders/getExecutedOrders"),
        ]);

        // Convert responses to JSON
        const portfolioData = await portfolioRes.json();
        const pendingData = await pendingRes.json();
        const historyData = await historyRes.json();

        // Store into React state
        setPortfolio(Array.isArray(portfolioData.portfolio) ? portfolioData.portfolio : []);
        setCashBalance(Number(portfolioData.currentCash || 0));

        setPendingOrders(Array.isArray(pendingData.orders) ? pendingData.orders : []);
        setTradeHistory(Array.isArray(historyData.trades) ? historyData.trades : []);

      } catch (error) {
        console.error("Error loading simulator data:", error);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const portfolioValue = 0;

  return (
    <div className="space-y-6">

      {/* Portfolio Chart */}
      <PortfolioChart />

    </div>
  );
}
