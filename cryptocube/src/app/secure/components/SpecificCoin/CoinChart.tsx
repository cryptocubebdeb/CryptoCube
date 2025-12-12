// /app/secure/components/CoinChart.tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { getCoinChart } from "../../../lib/getCoinChart";
import LineChart from "./LineChart";
import WatchlistButton from "./WatchlistBtn";

type RawPoint = { time: number; price: number };
type Point = { x: number; y: number }; // chaque point du graphique doit avoir un prix pour un instant donné

type params = {
  coinId: string;
  currency?: string;   // default "usd"
};

export default function CoinChart({ coinId, currency = "usd" }: params) {
  const { t } = useTranslation();
  const [days, setDays] = useState(30); // valeur par défaut : 30 jours
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/coinChart?coinId=${coinId}&days=${days}&currency=${currency}`);
        const raw = await res.json();

        const prices = Array.isArray(raw) ? raw : raw.prices ?? [];
        setData(prices.map((p: { time: number; price: number }) => ({ x: p.time, y: p.price })));

      } catch (error) {
        console.error("Error fetching coin chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId, days, currency]);

  const ranges = [
    { labelKey: 'coinsPage.range24h', value: 1 },
    { labelKey: 'coinsPage.range7d', value: 7 },
    { labelKey: 'coinsPage.range30d', value: 30 },
    { labelKey: 'coinsPage.range90d', value: 90 },
    { labelKey: 'coinsPage.range1y', value: 365 },
    //{ label: "5Y", value: 1825 },
    //FIGURE OUT HOW TO ADD A MAX RANGE { label: "MAX", value: "max" },
  ]

  return (
    <div className="flex flex-col w-full text-white">
      {/* === Header Row === */}
      <div className="flex justify-between items-center mb-4">

        {/* Bouton liste de suivi (gauche) */}
        <div style={{ marginLeft: '1rem' }}>
          <WatchlistButton coinId={coinId}/>
        </div>

        {/* Boutons de plage temporelle */}
        <div className="flex gap-2 mb-4 mr-3">
          {ranges.map(range => (
            <button
              key={range.value}
              onClick={() => setDays(range.value)}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.95rem',
                background: days === range.value ? 'var(--foreground-alt)' : 'var(--auth-background)',
                color: days === range.value ? 'var(--background)' : 'var(--foreground-grey)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.18s',
              }}
              onMouseOver={e => {
                if (days !== range.value) e.currentTarget.style.background = 'var(--chart-range-hover)';
              }}
              onMouseOut={e => {
                if (days !== range.value) e.currentTarget.style.background = 'var(--auth-background)';
              }}
            >
              {t(range.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <p className="text-white/60">{t('coinsPage.chartLoading')}</p>
      ) : (
        <LineChart width={window.innerWidth * 0.9} height={window.innerHeight} data={data} />
      )}
    </div>
  );
}