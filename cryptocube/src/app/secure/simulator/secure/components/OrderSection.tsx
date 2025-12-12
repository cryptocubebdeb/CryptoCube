"use client";

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

// Define the structure of a pending order
type PendingOrder = {
  id: number;
  coinId: string;
  coinSymbol: string;
  amount: string;
  orderType: "BUY" | "SELL";       // Side of the order
  orderKind: "MARKET" | "LIMIT";   // Type of order
  price: string | null;            // Price specified in the order, null for market
  createdAt: string;               // Timestamp when order was placed
};

export default function OrdersSection() {
  const { t } = useTranslation();
  // State to store the list of pending orders
  const [orders, setOrders] = useState<PendingOrder[]>([]);

  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Message to show feedback for cancel actions
  const [msg, setMsg] = useState("");

  // Function to fetch pending orders from the API
  async function loadPendingOrders() {
    try {
      setLoading(true);
      const response = await fetch("/api/simulator/orders/list/pending");
      const data = await response.json();

      // Check for API errors
      if (!response.ok) {
        console.error("Failed to load pending orders:", data.error);
        setOrders([]);
        return;
      }

      // Safely store the orders array
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("Error loading pending orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  // Load pending orders when the component mounts
  useEffect(() => {
    loadPendingOrders();
  }, []);

  // Function to cancel a pending order
  async function cancelOrder(orderId: number) {
    setMsg("");

    try {
      const response = await fetch(`/api/simulator/orders/${orderId}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(data.error || t('simulator.cancelFailed'));
        return;
      }

      // Notify the user and refresh the order list
      setMsg(t('simulator.orderCancelled'));
      loadPendingOrders();
    } catch (err) {
      console.error("Cancel error:", err);
      setMsg(t('simulator.cancelError'));
    }
  }

  // Show loading message while fetching data
  if (loading) {
    return (
      <div className="text-white/60 text-sm">{t('simulator.loadingPendingOrders')}</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section title */}
      <h2 className="text-xl font-bold" style={{ color: 'var(--foreground-alt)' }}>{t('simulator.pendingOrders')}</h2>
    
      {/* Display message if there are no pending orders */}
      {orders.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{t('simulator.noPendingOrders')}</p>
      )}

      {/* List of pending orders */}
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl p-4 shadow-sm"
            style={{ backgroundColor: 'var(--color-container-bg)' }}
          >
            <div className="flex justify-between items-center">
              {/* Left side: order details */}
              <div>
                <p className="text-sm font-semibold">
                  {order.orderType === 'BUY' ? t('activity.buy').toUpperCase() : t('activity.sell').toUpperCase()} {order.coinSymbol}

                  {order.orderKind === "LIMIT" && (
                    <span className="text-xs ml-2" style={{ color: 'var(--foreground-alt)' }}>({t('activity.limitAt', { price: Number(order.price).toFixed(2) })})</span>
                  )}

                  {order.orderKind === "MARKET" && (
                    <span className="text-xs ml-2" style={{ color: 'var(--foreground-alt)' }}>({t('activity.market')})</span>
                  )}
                </p>

                <p className="text-xs" style={{ color: 'var(--foreground-grey)', marginTop: '0.25rem' }}>
                  {t('simulator.amount')}: {Number(order.amount).toFixed(6)}
                </p>

                <p className="text-[10px]" style={{ color: 'var(--foreground-grey)' }}>
                  {t('simulator.placed')}: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Right side: cancel button */}
              <button
                onClick={() => cancelOrder(order.id)}
                className="px-3 py-1.5 text-xs rounded-md"
                style={{ backgroundColor: 'var(--color-red)', color: 'var(--background)', transition: 'background 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-red-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-red)'; }}
              >
                {t('simulator.cancel')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback message for user actions */}
      {msg && (
        <p className="text-xs text-center mt-1" style={{ color: 'var(--foreground-alt)' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
