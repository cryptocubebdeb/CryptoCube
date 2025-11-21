"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PanelPortfolioItem = {
  coinId: string;
  coinSymbol: string;
  amountOwned: number;
  averageEntryPriceUsd: number;
};

export default function TradeSidePanel() {

  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");

  const [portfolio, setPortfolio] = useState<PanelPortfolioItem[]>([]);
  const [cash, setCash] = useState(0);

  const [coinId, setCoinId] = useState("");
  const [symbol, setSymbol] = useState("");

  const [price, setPrice] = useState(0);
  const [logoUrl, setLogoUrl] = useState("");

  const [inputMode, setInputMode] = useState<"FIAT" | "CRYPTO">("FIAT");
  const [value, setValue] = useState("");

  // UI feedback
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/simulator/getPortfolio");
        const data = await res.json();

        const list: PanelPortfolioItem[] = Array.isArray(data.portfolio)
          ? data.portfolio
          : [];

        setPortfolio(list);
        setCash(Number(data.currentCash || 0));

        if (list.length > 0) {
          setCoinId(list[0].coinId);
          setSymbol(list[0].coinSymbol);
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  useEffect(() => {
    // If no coin is selected yet, do nothing
    if (!coinId) return;

    async function loadCoinData() {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}`
        );
        const data = await res.json();

        // Current CAD price
        setPrice(data?.market_data?.current_price?.cad ?? 0);

        // Small logo url
        setLogoUrl(data?.image?.small ?? "");
      } catch (err) {
        console.error("Failed to load coin data", err);
        setPrice(0);
        setLogoUrl("");
      }
    }

    loadCoinData();
  }, [coinId]);

  // How many coins the current input represents
  const cryptoAmount =
    inputMode === "CRYPTO"
      ? Number(value || 0)
      : price > 0
      ? Number(value || 0) / price
      : 0;

  const fiatAmount =
    inputMode === "FIAT"
      ? Number(value || 0)
      : Number(value || 0) * price;

  function handleMax() {
    if (mode === "BUY") {
      // Max = all cash
      if (inputMode === "FIAT") {
        setValue(cash.toString());
      } else {
        // Max coins = cash / price
        const maxCoin = price > 0 ? cash / price : 0;
        setValue(maxCoin.toFixed(6));
      }
    } else {
      // SELL mode: find how much of this coin the user owns
      const holding = portfolio.find((p) => p.coinId === coinId);
      const owned = Number(holding?.amountOwned || 0);

      if (inputMode === "CRYPTO") {
        setValue(owned.toString());
      } else {
        const maxCad = owned * price;
        setValue(maxCad.toFixed(2));
      }
    }
  }

  async function submitOrder() {
    setSubmitting(true);
    setMsg("");

    // Basic validation
    if (!coinId || !symbol) {
      setMsg("No coin selected.");
      setSubmitting(false);
      return;
    }

    if (!value || Number(value) <= 0) {
      setMsg("Enter a valid amount.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/simulator/orders/postOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinId,               // ex: "bitcoin"
          tradeSymbol: symbol,  // ex: "BTCUSDT" or "BTC"
          quantity: cryptoAmount,
          orderKind: "market",
          orderSell: mode.toLowerCase(), // "buy" or "sell"
          price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Order failed.");
      } else {
        setMsg(`${mode} order placed.`);
        setValue("");
      }
    } catch (err) {
      console.error("Order error:", err);
      setMsg("Network error while placing order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-white/60 text-sm">
        Loading…
      </div>
    );
  }

  // If user has no portfolio yet
  if (!portfolio.length) {
    return (
      <div className="text-white/70 text-sm">
        You don&apos;t own any coins yet.  
        Go to a coin page to place your first BUY order.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white space-y-6">

      {/* Title */}
      <h2 className="text-xl font-bold text-center text-yellow-400">
        Trade
      </h2>

      {/* BUY / SELL tabs */}
      <div className="flex bg-white/5 rounded-md overflow-hidden">
        {["BUY", "SELL"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMode(tab as "BUY" | "SELL")}
            className={`flex-1 py-2 text-sm font-semibold transition
              ${mode === tab ? "bg-yellow-400 text-black" : "text-white/60 hover:bg-white/10"}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Coin selector */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Select Coin</p>

        <div className="relative">
          <select
            className="
              appearance-none
              w-full bg-[#0e1117] border border-white/10 rounded-xl
              px-10 py-3 text-sm
            "
            value={coinId}
            onChange={(e) => {
              const selected = portfolio.find(
                (c) => c.coinId === e.target.value
              );

              if (!selected) {
                console.warn("Selected coin not found in portfolio");
                return;
              }

              setCoinId(selected.coinId);
              setSymbol(selected.coinSymbol);
            }}
          >
            {portfolio.map((item) => (
              <option key={item.coinId} value={item.coinId}>
                {item.coinSymbol}
              </option>
            ))}
          </select>

          {/* Custom arrow */}
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
            ▼
          </div>

          {/* Coin logo */}
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="coin logo"
              width={24}
              height={24}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
            />
          )}
        </div>
      </div>

      {/* Big centered input */}
      <div className="mt-1 flex flex-col items-center">
        <span className="text-[10px] tracking-[0.25em] text-slate-500 uppercase">
          {inputMode === "FIAT" ? "CA$" : symbol}
        </span>

        <input
          type="text"              
          inputMode="decimal"     
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className="
            w-full bg-transparent text-center text-5xl font-semibold
            outline-none text-white py-3
          "
        />
      </div>

      {/* Quick amount buttons */}
      <div className="flex justify-center gap-3 mt-3">
        {mode === "BUY" ? (
          <>
            <button
              onClick={() => setValue("20")}
              className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              CA$20
            </button>
            <button
              onClick={() => setValue("50")}
              className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              CA$50
            </button>
            <button
              onClick={() => setValue("100")}
              className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              CA$100
            </button>
            <button
              onClick={handleMax}
              className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              MAX
            </button>
          </>
        ) : (
          <button
            onClick={handleMax}
            className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
          >
            MAX
          </button>
        )}
      </div>

      {/* CAD / Coin toggle */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setInputMode("FIAT")}
          className={`flex-1 py-2 rounded-md 
            ${inputMode === "FIAT" ? "bg-yellow-400 text-black" : "bg-white/10 text-white/60"}
          `}
        >
          CAD
        </button>

        <button
          onClick={() => setInputMode("CRYPTO")}
          className={`flex-1 py-2 rounded-md 
            ${inputMode === "CRYPTO" ? "bg-yellow-400 text-black" : "bg-white/10 text-white/60"}
          `}
        >
          {symbol}
        </button>
      </div>

      {/* Conversion preview */}
      <p className="text-xs text-center text-slate-400">
        {inputMode === "FIAT"
          ? `≈ ${cryptoAmount.toFixed(6)} ${symbol}`
          : `≈ $${fiatAmount.toFixed(2)} CAD`}
      </p>

      {/* Submit button */}
      <button
        onClick={submitOrder}
        disabled={submitting}
        className="w-full py-2 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-300 disabled:opacity-60"
      >
        {submitting ? "Processing…" : `${mode} ${symbol}`}
      </button>

      {msg && (
        <p className="text-xs text-center text-yellow-300 mt-1">
          {msg}
        </p>
      )}
    </div>
  );
}
