// /app/secure/components/CoinChart.tsx
"use client";
import { useEffect, useState } from "react";
import { getCoinChart } from "../../../lib/getCoinChart";
import LineChart from "./LineChart";

type RawPoint = { time: number; price: number };
type Point = { x: number; y: number }; //each point in the graphic must have a price for a specific time

type params = {
  coinId: string;
  currency?: string;   // default "cad"
};

export default function CoinChart({ coinId, currency = "cad" }: params) {
  const [days, setDays] = useState(30); //default 30 days
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
    { label: "24H", value: 1 },
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "1Y", value: 365 },
    { label: "5Y", value: 1825 },
    //FIGURE OUT HOW TO ADD A MAX RANGE { label: "MAX", value: "max" },
  ]

  return (
    <div className="flex flex-col items-center">
      {/* Time range buttons */}
      <div className="flex gap-2 mb-4">
        {ranges.map(range => (
          <button
            key={range.value}
            onClick={() => setDays(range.value)}
            className={`px-3 py-1 rounded-md text-sm ${days === range.value
              ? "bg-yellow-500 text-black"
              : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <p className="text-white/60">Loading chart...</p>
      ) : (
        <LineChart width={window.innerWidth * 1.3} height={window.innerHeight * 0.7} data={data} />
      )}
    </div>
  );
}