"use client";

import { useEffect, useState } from "react";
import { T } from "../../components/Translate";

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
    <div className="mt-8 border border-white/10 rounded-md p-4" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)' }}>
      <h2 className="text-2xl mb-4" style={{ color: 'var(--foreground)', opacity: 0.9 }}><T k="specificCoin.livebinancetrades" /></h2>

      <div
        className="max-h-64 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--foreground) transparent'
        }}
      >
        <style>{`
          .livebinance-scroll::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .livebinance-scroll::-webkit-scrollbar-thumb {
            background: var(--foreground);
            border-radius: 6px;
          }
        `}</style>
        <div className="livebinance-scroll">
        <table className="w-full text-sm" style={{ color: 'var(--foreground)' }}>
          <thead className="border-b border-white/10" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
            <tr>
              <th className="text-left py-1"><T k="specificCoin.tradeTime" /></th>
              <th className="text-right py-1"><T k="specificCoin.tradePrice" /></th>
              <th className="text-right py-1"><T k="specificCoin.tradeAmount" /></th>
              <th className="text-right py-1 pr-4"><T k="specificCoin.tradeSide" /></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-1" style={{ color: 'var(--foreground)' }}>
                  {new Date(t.T).toLocaleTimeString()}
                </td>
                <td className="py-1 text-right" style={{ color: 'var(--foreground)' }}>{parseFloat(t.p).toFixed(4)}</td>
                <td className="py-1 text-right" style={{ color: 'var(--foreground)' }}>{parseFloat(t.q).toFixed(6)}</td>
                <td
                  className="py-1 text-right pr-4"
                  style={{ color: t.m ? 'var(--color-red)' : 'var(--color-green)', fontWeight: 500 }}
                >
                  {t.m ? <T k="specificCoin.tradeSell" /> : <T k="specificCoin.tradeBuy" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
