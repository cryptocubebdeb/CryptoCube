"use client";

import { useEffect, useState } from "react";

interface BinanceTrade {
  p: string; // price
  q: string; // quantity
  T: number; // trade time (ms)
  m: boolean; // is buyer market maker
}

export default function LiveBinanceTrades({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<BinanceTrade[]>([]);

  useEffect(() => {
    const wsSymbol = symbol.toLowerCase() + "usdt";

    // Binance WebSocket for live trades
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${wsSymbol}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as BinanceTrade;

      setTrades((prev) => {
        const next = [data, ...prev];
        return next.slice(0, 50); // keep last 50 trades
      });
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="mt-8 bg-[#12141A] border border-white/10 rounded-md p-4">
      <h2 className="text-2xl text-white/90 mb-4">Live Binance Trades</h2>

      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-sm text-white/80">
          <thead className="text-white/50 border-b border-white/10">
            <tr>
              <th className="text-left py-1">Time</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Amount</th>
              <th className="text-right py-1">Side</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-1">
                  {new Date(t.T).toLocaleTimeString()}
                </td>
                <td className="py-1 text-right">{parseFloat(t.p).toFixed(4)}</td>
                <td className="py-1 text-right">{parseFloat(t.q).toFixed(6)}</td>
                <td
                  className={`py-1 text-right ${
                    t.m ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {t.m ? "SELL" : "BUY"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
