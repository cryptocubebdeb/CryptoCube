"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Holding = {
  id: number;
  coinId: string;
  coinSymbol: string;
  amountOwned: number;
  averageEntryPriceUsd: number;
};

export default function TradeSidePanel() {
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [orderKind, setOrderKind] = useState<"MARKET" | "LIMIT">("MARKET");

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [cash, setCash] = useState(0);

  const [coinId, setCoinId] = useState("");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState(0);
  const [logoUrl, setLogoUrl] = useState("");

  const [inputMode, setInputMode] = useState<"FIAT" | "CRYPTO">("FIAT");
  const [value, setValue] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load portfolio
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/simulator/portfolio");
        const data = await res.json();

        setCash(Number(data.cash || 0));

        const list: Holding[] = Array.isArray(data.holdings)
          ? data.holdings
          : [];
        setHoldings(list);

        if (list.length > 0) {
          setCoinId(list[0].coinId);
          setSymbol(list[0].coinSymbol);
        }
      } catch (err) {
        console.error("Failed to load portfolio for trading", err);
        setCash(0);
        setHoldings([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Load price + logo
  useEffect(() => {
    if (!coinId) return;

    async function loadCoin() {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}`
        );
        const data = await res.json();

        setPrice(data?.market_data?.current_price?.usd ?? 0);
        setLogoUrl(data?.image?.small ?? "");
      } catch {
        setPrice(0);
        setLogoUrl("");
      }
    }

    loadCoin();
  }, [coinId]);

  const limitPriceNum = Number(limitPrice || 0);
  const effectivePrice =
    orderKind === "LIMIT" && limitPriceNum > 0 ? limitPriceNum : price;

  const cryptoAmount =
    inputMode === "CRYPTO"
      ? Number(value || 0)
      : effectivePrice > 0
        ? Number(value || 0) / effectivePrice
        : 0;

  const fiatAmount =
    inputMode === "FIAT"
      ? Number(value || 0)
      : Number(value || 0) * effectivePrice;

  // Max button
  function handleMax() {
    if (!coinId) return;

    if (mode === "BUY") {
      if (inputMode === "FIAT") setValue(cash.toString());
      else {
        const max = effectivePrice > 0 ? cash / effectivePrice : 0;
        setValue(max.toFixed(6));
      }
    } else {
      const holding = holdings.find((h) => h.coinId === coinId);
      const owned = Number(holding?.amountOwned || 0);
      if (inputMode === "CRYPTO") setValue(owned.toString());
      else {
        const maxUsd = owned * effectivePrice;
        setValue(maxUsd.toFixed(2));
      }
    }
  }

  // Submit
  async function submitOrder() {
    setSubmitting(true);
    setMsg("");

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

    const amountCoins = cryptoAmount;
    if (amountCoins <= 0) {
      setMsg("Amount is too small.");
      setSubmitting(false);
      return;
    }

    if (orderKind === "LIMIT" && (!limitPrice || limitPriceNum <= 0)) {
      setMsg("Enter a valid limit price.");
      setSubmitting(false);
      return;
    }

    if (mode === "BUY") {
      const needed = amountCoins * effectivePrice;
      if (needed > cash) {
        setMsg("Not enough cash.");
        setSubmitting(false);
        return;
      }
    }

    if (mode === "SELL") {
      const holding = holdings.find((h) => h.coinId === coinId);
      const owned = Number(holding?.amountOwned || 0);
      if (!holding || owned <= 0) {
        setMsg("You do not own this coin.");
        setSubmitting(false);
        return;
      }
      if (amountCoins > owned) {
        setMsg("Not enough coins.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const body = {
        coinId,
        coinSymbol: symbol,
        amount: amountCoins,
        orderType: mode,
        orderKind,
        price: orderKind === "LIMIT" ? limitPriceNum : undefined,
      };

      const res = await fetch("/api/simulator/orders/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Order failed.");
      } else {
        setMsg(`${orderKind} ${mode} order placed.`);
        setValue("");
        if (orderKind === "MARKET") setLimitPrice("");
      }
    } catch (err) {
      setMsg("Network error while placing order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-white/60 text-sm">Loading trading panel…</div>;
  }

  return (
    <div className="flex flex-col h-full text-white space-y-6">
      <h2 className="text-xl font-bold text-center text-yellow-400">
        Trade
      </h2>

      {/* BUY / SELL */}
      <div className="flex bg-white/5 rounded-md overflow-hidden">
        {["BUY", "SELL"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setMode(t as "BUY" | "SELL");
              setMsg("");
            }}
            className={`flex-1 py-2 text-sm font-semibold ${mode === t
                ? "bg-yellow-400 text-black"
                : "text-white/60 hover:bg-white/10"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MARKET / LIMIT */}
      <div className="flex bg-white/5 rounded-md overflow-hidden">
        {["MARKET", "LIMIT"].map((k) => (
          <button
            key={k}
            onClick={() => setOrderKind(k as "MARKET" | "LIMIT")}
            className={`flex-1 py-1.5 text-xs font-semibold ${orderKind === k
                ? "bg-yellow-400 text-black"
                : "text-white/60 hover:bg-white/10"
              }`}
          >
            {k}
          </button>
        ))}
      </div>

      {orderKind === "LIMIT" && (
        <div>
          <p className="text-xs text-slate-400 mb-1">Limit price (USD)</p>
          <input
            type="text"
            inputMode="decimal"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full bg-[#0e1117] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </div>
      )}

      {/* Select coin */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Select Coin</p>
        <div className="relative">
          <select
            className="appearance-none w-full bg-[#0e1117] border border-white/10 rounded-xl px-10 py-3 text-sm"
            value={coinId}
            onChange={(e) => {
              const found = holdings.find((h) => h.coinId === e.target.value);
              setCoinId(e.target.value);
              setSymbol(found?.coinSymbol || symbol);
            }}
          >
            {holdings.map((h) => (
              <option key={h.coinId} value={h.coinId}>
                {h.coinSymbol}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
            ▼
          </div>

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

      {/* Amount input */}
      <div className="mt-1 flex flex-col items-center">
        <span className="text-[10px] tracking-[0.25em] text-slate-500 uppercase">
          {inputMode === "FIAT" ? "USD" : symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-center text-5xl font-semibold outline-none text-white py-3"
        />
      </div>

      {/* MAX */}
      <div className="flex justify-center gap-3 mt-3">
        {mode === "BUY" ? (
          <>
            {[20, 50, 100].map((usd) => (
              <button
                key={usd}
                onClick={() => setValue(usd.toString())}
                className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                USD{usd}
              </button>
            ))}
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

      {/* Toggle USD/coin */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setInputMode("FIAT")}
          className={`flex-1 py-2 rounded-md ${inputMode === "FIAT"
              ? "bg-yellow-400 text-black"
              : "bg-white/10 text-white/60"
            }`}
        >
          USD
        </button>

        <button
          onClick={() => setInputMode("CRYPTO")}
          className={`flex-1 py-2 rounded-md ${inputMode === "CRYPTO"
              ? "bg-yellow-400 text-black"
              : "bg-white/10 text-white/60"
            }`}
        >
          {symbol}
        </button>
      </div>

      {/* Conversion preview */}
      <p className="text-xs text-center text-slate-400">
        {inputMode === "FIAT"
          ? `≈ ${cryptoAmount.toFixed(6)} ${symbol}`
          : `≈ $${fiatAmount.toFixed(2)} USD`}
      </p>

      {/* Submit */}
      <button
        onClick={submitOrder}
        disabled={submitting}
        className="w-full py-2 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-300 disabled:opacity-60"
      >
        {submitting
          ? "Processing…"
          : `${mode} ${symbol} (${orderKind.toLowerCase()})`}
      </button>

      {msg && (
        <p className="text-xs text-center text-yellow-300 mt-1">{msg}</p>
      )}
    </div>
  );
}
