"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { useRouter } from "next/navigation";

type Holding = {
  id: number;
  coinId: string;
  coinSymbol: string;
  amountOwned: number;
  averageEntryPriceUsd: number;
};

export default function WalletSection() {
  const { t } = useTranslation();
  const router = useRouter();

  const [cash, setCash] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  const [logos, setLogos] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    symbol: string;
    value: number;
    pct: number;
    id: string;
  } | null>(null);

  useEffect(() => {
    async function loadWallet() {
      try {
        const res = await fetch("/api/simulator/portfolio");
        const data = await res.json();

        setCash(Number(data.cash || 0));

        if (Array.isArray(data.holdings)) {
          const sorted = [...data.holdings].sort((a, b) => {
            const v1 = Number(a.amountOwned) * Number(a.averageEntryPriceUsd);
            const v2 = Number(b.amountOwned) * Number(b.averageEntryPriceUsd);
            return v2 - v1;
          });
          setHoldings(sorted);
        } else {
          setHoldings([]);
        }
      } catch {
        setCash(0);
        setHoldings([]);
      }

      setLoading(false);
    }

    loadWallet();
  }, []);

  useEffect(() => {
    async function fetchLogos() {
      const result: Record<string, string> = {};

      await Promise.all(
        holdings.map(async (h) => {
          try {
            const r = await fetch(
              `https://api.coingecko.com/api/v3/coins/${h.coinId}`
            );
            const json = await r.json();
            result[h.coinSymbol] = json.image?.small || "";
          } catch {
            result[h.coinSymbol] = "";
          }
        })
      );

      setLogos(result);
    }

    if (holdings.length > 0) fetchLogos();
  }, [holdings]);

  const COLORS = [
    "#FFDD00",
    "#0EA5E9",
    "#16A34A",
    "#EF4444",
    "#A855F7",
    "#F97316",
    "#14B8A6",
    "#EAB308",
  ];

  const chartData = holdings.map((h) => ({
    name: h.coinSymbol,
    id: h.coinId,
    logo: logos[h.coinSymbol] || "",
    value: Number(h.amountOwned) * Number(h.averageEntryPriceUsd),
    amount: Number(h.amountOwned),
  }));

  const total = chartData.reduce((s, c) => s + c.value, 0);

  // EXPLODING SLICE
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    const offset = 12;
    const mx = cx + (outerRadius + offset) * cos;
    const my = cy + (outerRadius + offset) * sin;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />

        <text
          x={mx}
          y={my}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: "12px", fontWeight: "600" }}
        >
          {((value / total) * 100).toFixed(1)}%
        </text>
      </g>
    );
  };

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-yellow-400">{t("wallet.title")}</h2>

        <p className="text-sm text-slate-400">
          {t("wallet.cashLabel")}{" "}
          <span className="text-white">${cash.toFixed(2)}</span>
        </p>
      </div>

      {loading && <p className="text-slate-400">{t("wallet.loading")}</p>}
      {!loading && holdings.length === 0 && (
        <p className="text-slate-500">{t("wallet.noHoldings")}</p>
      )}

      {/* ============================
           CHART LEFT — LIST RIGHT
      ============================== */}
      {!loading && holdings.length > 0 && (
        <div className="flex gap-6">

          {/* ─────────── LEFT : PIE CHART ─────────── */}
          <div className="w-[60%] h-[380px] relative">

            {/* CUSTOM TOOLTIP */}
            {hoverInfo && (
              <div
                className="absolute z-50 px-3 py-2 rounded-lg bg-[#1b1e27] border border-[#2a2d36] shadow-lg"
                style={{
                  top: hoverInfo.y - 40,
                  left: hoverInfo.x + 20,
                  pointerEvents: "none",
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={logos[hoverInfo.symbol]}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-white font-semibold">
                    {hoverInfo.symbol}
                  </span>
                </div>
                <div className="text-slate-300 text-sm">
                  ${hoverInfo.value.toFixed(2)}
                </div>
                <div className="text-yellow-400 text-xs font-semibold">
                  {hoverInfo.pct.toFixed(1)}%
                </div>
              </div>
            )}

            <ResponsiveContainer>
              <PieChart
                onMouseMove={(e: any) => {
                  if (!e?.activePayload) {
                    setHoverInfo(null);
                    return;
                  }

                  const p = e.activePayload[0].payload;
                  setHoverInfo({
                    x: e.chartX,
                    y: e.chartY,
                    symbol: p.name,
                    value: p.value,
                    pct: (p.value / total) * 100,
                    id: p.id,
                  });
                }}
                onMouseLeave={() => setHoverInfo(null)}
              >
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                  onClick={(entry) =>
                    router.push(`/secure/specificCoin/${entry.id}`)
                  }
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ─────────── RIGHT : SIMPLE LIST ─────────── */}
          <div className="w-[40%] space-y-2">
            {chartData.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-[#15171f] border border-[#23252c] px-4 py-3 rounded-lg cursor-pointer hover:bg-[#1b1e27]"
                onClick={() => router.push(`/secure/specificCoin/${c.id}`)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.logo}
                    className="w-7 h-7 rounded-full"
                    alt={c.name}
                  />
                  <div>
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-slate-400 text-xs">
                      {(c.value / total * 100).toFixed(1)}% {t('wallet.ofPortfolio')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${c.value.toFixed(2)}
                  </p>
                  <p className="text-slate-400 text-xs">{c.amount.toFixed(6)}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
