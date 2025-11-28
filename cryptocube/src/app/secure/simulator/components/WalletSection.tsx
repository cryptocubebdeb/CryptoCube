"use client";

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

type Holding = {
  id: number;
  coinId: string;
  coinSymbol: string;
  amountOwned: number;
  averageEntryPriceUsd: number;
};

export default function WalletSection() {
  const { t } = useTranslation();
  const [cash, setCash] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWallet() {
      try {
        const res = await fetch("/api/simulator/portfolio");
        const data = await res.json();

        setCash(Number(data.cash || 0));
        setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
      } catch (err) {
        console.error("Failed to load wallet", err);
        setCash(0);
        setHoldings([]);
      }

      setLoading(false);
    }

    loadWallet();
  }, []);

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-yellow-400">{t('wallet.title')}</h2>

        <p className="text-sm text-slate-400">
          {t('wallet.cashLabel')}{" "}
          <span className="text-white">${cash.toFixed(2)}</span>
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-slate-400 text-sm">{t('wallet.loading')}</p>
      )}

      {/* Empty */}
      {!loading && holdings.length === 0 && (
        <p className="text-slate-500 text-sm">{t('wallet.noHoldings')}</p>
      )}

      {/* Holdings List */}
      {!loading && holdings.length > 0 && (
        <div className="space-y-2">
          {holdings.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between bg-[#15171f] border border-[#23252c] rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-semibold text-white">{h.coinSymbol}</p>
                <p className="text-xs text-slate-400">
                  {t('wallet.avgEntry', { price: Number(h.averageEntryPriceUsd).toFixed(4) })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {Number(h.amountOwned).toFixed(6)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
