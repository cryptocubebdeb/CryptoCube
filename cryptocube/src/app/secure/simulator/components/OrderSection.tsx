"use client";

import { useEffect, useState } from "react";
import { PendingOrder } from "@/app/api/simulator/simulatorTypes";

/*
  This component shows all pending orders 
  (orders not executed yet).
*/

export default function OrdersSection() {
  // List of pending orders
  const [orders, setOrders] = useState<PendingOrder[]>([]);

  // Show a loading message while fetching data
  const [loading, setLoading] = useState(true);

  // Load orders from backend
  async function loadPendingOrders() {
    try {
      const res = await fetch("/api/simulator/orders/getPendingOrders");
      const data = await res.json();

      // Validate that we always store an array
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Failed to load pending orders:", error);
      setOrders([]); // fallback to avoid TS errors
    }

    setLoading(false);
  }

  // Load once on component mount
  useEffect(() => {
    loadPendingOrders();
  }, []);

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-yellow-400">Pending Orders</h2>
      </div>

      {/* Loading state */}
      {loading && (
        <p className="text-slate-400 text-sm">Loading pending orders…</p>
      )}

      {/* No orders */}
      {!loading && orders.length === 0 && (
        <p className="text-slate-500 text-sm">No pending orders.</p>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3"
            >
              {/* Left side: info */}
              <div>
                <p className="font-semibold text-white">
                  {order.orderType} {order.coinSymbol}
                </p>

                <p className="text-xs text-slate-400">
                  {Number(order.amount).toFixed(6)} • $
                  {order.price ?? "-"}
                </p>
              </div>

              {/* Right side: type badge */}
              <div className="text-right text-xs">
                <span className="px-2 py-1 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  {order.orderKind}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
