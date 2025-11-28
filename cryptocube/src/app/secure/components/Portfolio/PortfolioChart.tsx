"use client";
import { useRef, useEffect, useState } from "react";
import LineChart from "../../components/SpecificCoin/LineChart";

type HistoryPoint = {
  createdAt: string;
  totalValueUsd: string;
};

const RANGES = [
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 180 },
  { key: "1Y", days: 365 },
  { key: "ALL", days: null }, // no filter
];

export default function PortfolioChart({ width, height }: { width?: number; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 500 });

  const [rawData, setRawData] = useState<{ x: number; y: number }[]>([]);
  const [filteredData, setFilteredData] = useState<{ x: number; y: number }[]>([]);
  const [selectedRange, setSelectedRange] = useState("ALL");

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setDimensions({
        width,
        height: Math.max(400, width * 0.4),
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch history from API
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/simulator/portfolio/history");
        if (!res.ok) return;

        const points: HistoryPoint[] = await res.json();

        const mapped = points.map((p) => ({
          x: new Date(p.createdAt).getTime(),
          y: Number(p.totalValueUsd),
        }));

        setRawData(mapped);
        setFilteredData(mapped); // initial = all data
      } catch (err) {
        console.error("Failed to load portfolio history:", err);
      }
    }

    loadHistory();
  }, []);

  // Apply date filter when range changes
  useEffect(() => {
    if (selectedRange === "ALL") {
      setFilteredData(rawData);
      return;
    }

    const entry = RANGES.find((r) => r.key === selectedRange);
    if (!entry || entry.days === null) return;

    const cutoff = Date.now() - entry.days * 86400000;

    setFilteredData(rawData.filter((p) => p.x >= cutoff));
  }, [selectedRange, rawData]);

  const chartWidth = width ?? 0.95 * dimensions.width;
  const chartHeight = height ?? dimensions.height;

  return (
    <div ref={containerRef} className="shadow-md w-full max-w-[1600px] mx-auto">
      {/* RANGE SELECTOR */}
      <div className="flex gap-3 justify-end mb-4 pr-4">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setSelectedRange(r.key)}
            className={`px-3 py-1 rounded text-sm transition-all ${
              selectedRange === r.key
                ? "bg-yellow-400 text-black font-bold shadow"
                : "bg-slate-800 text-white/70 hover:bg-slate-700"
            }`}
          >
            {r.key}
          </button>
        ))}
      </div>

      <LineChart width={chartWidth} height={chartHeight} data={filteredData} />
    </div>
  );
}
