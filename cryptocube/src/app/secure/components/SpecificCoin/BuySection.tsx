"use client";

import { useState, useEffect } from "react";
import TradePanel from "./TradePanel";

export default function BuySection({ coinId, symbol, price, logo }) {
  // Which panel is open (buy or sell)
  const [openPanel, setOpenPanel] = useState<"BUY" | "SELL" | null>(null);

  // User portfolio states
  const [hasCoin, setHasCoin] = useState(false);
  const [userHolding, setUserHolding] = useState(null);
  const [cashBalance, setCashBalance] = useState(0);

  // Binance availability check
  const [binanceAvailable, setBinanceAvailable] = useState<boolean | null>(null);

  // Reset the panel whenever the user switches to a different coin
  useEffect(() => {
    setOpenPanel(null);
  }, [coinId]);

  // Load simulator portfolio and update holdings + cash
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch("/api/simulator/portfolio");
        const data = await response.json();

        if (!response.ok || data.error) return;

        // Real simulator cash
        setCashBalance(Number(data.cash || 0));

        // Try finding user holding for this coin
        const matchedHolding = data.holdings?.find((item) => {
          return (
            item.coinId === coinId ||
            item.coinSymbol.toLowerCase() === symbol.toLowerCase()
          );
        });

        setUserHolding(matchedHolding || null);
        setHasCoin(matchedHolding && Number(matchedHolding.amountOwned) > 0);
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      }
    }

    loadPortfolio();
  }, [coinId, symbol]);

  // Check if the coin exists on Binance (ex: BTCUSDT, ETHUSDT)
  useEffect(() => {
    async function checkBinance() {
      try {
        const formattedSymbol = symbol.toUpperCase();
        const url = `https://api.binance.com/api/v3/ticker/price?symbol=${formattedSymbol}USDT`;

        const response = await fetch(url);

        if (!response.ok) {
          setBinanceAvailable(false);
          return;
        }

        const data = await response.json();
        setBinanceAvailable(data.price ? true : false);
      } catch {
        setBinanceAvailable(false);
      }
    }

    checkBinance();
  }, [symbol]);

  // Toggle buy panel
  function toggleBuy() {
    setOpenPanel(openPanel === "BUY" ? null : "BUY");
  }

  // Toggle sell panel (only if user has the coin)
  function toggleSell() {
    if (!hasCoin) return;
    setOpenPanel(openPanel === "SELL" ? null : "SELL");
  }

  return (
  <div className="rounded-lg p-3 w-full max-w-sm shadow-lg" style={{ background: 'var(--color-container-bg)', border: '1px solid var(--foreground-alt)', color: 'var(--foreground)' }}>
      {/* When Binance doesn’t support this coin */}
      {binanceAvailable === false && (
        <p className="text-sm mb-2 text-center" style={{ color: 'var(--color-red)' }}>
          This coin is not available for trading on Binance.
        </p>
      )}

      {/* Buy + Sell buttons */}
      <div className="flex gap-2">
        <button
          onClick={toggleBuy}
          disabled={binanceAvailable === false}
          style={{
            background: openPanel === "BUY" ? 'var(--foreground-alt)' : 'rgba(9, 41, 224, 0.08)',
            color: openPanel === "BUY" ? 'var(--background)' : 'var(--foreground)',
            opacity: binanceAvailable === false ? 0.4 : 1,
            cursor: binanceAvailable === false ? 'not-allowed' : 'pointer',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.375rem 0',
            flex: 1
          }}
        >
          BUY
        </button>

        <button
          onClick={toggleSell}
          disabled={!hasCoin || binanceAvailable === false}
          style={{
            background: !hasCoin || binanceAvailable === false
              ? 'rgba(17, 81, 229, 0.05)'
              : openPanel === "SELL"
                ? 'var(--foreground-alt)'
                : 'rgba(13, 67, 216, 0.08)',
            color: !hasCoin || binanceAvailable === false
              ? 'var(--foreground)'
              : openPanel === "SELL"
                ? 'var(--foreground)'
                : 'var(--foreground)',
            opacity: !hasCoin || binanceAvailable === false ? 0.3 : 1,
            cursor: !hasCoin || binanceAvailable === false ? 'not-allowed' : 'pointer',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.375rem 0',
            flex: 1
          }}
        >
          SELL
        </button>
      </div>

      {/* Trade panel appears only if a mode is selected */}
      {openPanel && binanceAvailable !== false && (
        <div className="mt-3">
          <TradePanel
            mode={openPanel}
            symbol={symbol}
            coinId={coinId}
            price={price}
            logo={logo}
            holding={userHolding}
            currentCash={cashBalance}
          />
        </div>
      )}
    </div>
  );
}
