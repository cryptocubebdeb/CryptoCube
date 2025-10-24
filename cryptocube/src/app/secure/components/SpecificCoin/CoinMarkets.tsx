"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Data types from CoinGecko
type ExchangeMarket = {
  name: string;
  logo: string;
};

type ExchangeTicker = {
  market: ExchangeMarket;
  base: string;
  target: string;
  last: number;
  bid_ask_spread_percentage: number;
  volume: number;
  trust_score: string;
  last_traded_at: string;
  trade_url?: string;
};

export default function CoinMarkets({ coinId }: { coinId: string }) {
  const [marketTickers, setMarketTickers] = useState<ExchangeTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch markets
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/tickers`
        );
        const json = await response.json();
        setMarketTickers(json.tickers || []);
      } catch (error) {
        console.error("Error while loading market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, [coinId]);

  if (isLoading)
    return <div className="text-white/60 mt-4">Loading market data...</div>;
  if (!marketTickers.length)
    return (
      <div className="text-white/60 mt-4">
        No market data available for this coin.
      </div>
    );

  // Pagination logic
  const totalPages = Math.ceil(marketTickers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedTickers = marketTickers.slice(startIndex, startIndex + rowsPerPage);

  // Total volume for % calc
  const totalVolume = marketTickers.reduce((sum, ticker) => {
    const volume = ticker.volume || 0;
    return sum + volume;
  }, 0);

  const changePage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      containerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Show max 5 page numbers
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div
      ref={containerRef}
      className="border border-white/10 rounded-md p-6 text-white/85 shadow-md"
    >
      <h2 className="text-2xl mb-5 font-semibold">
        Markets for {coinId.toUpperCase()}
      </h2>

      {/* Fixed-layout table keeps columns consistent */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm table-fixed">
          <colgroup>
            <col className="w-[5%]" />   {/* # */}
            <col className="w-[18%]" />  {/* Exchange */}
            <col className="w-[10%]" />  {/* Pair */}
            <col className="w-[12%]" />  {/* Price */}
            <col className="w-[10%]" />  {/* Spread */}
            <col className="w-[15%]" />  {/* Volume */}
            <col className="w-[10%]" />  {/* Volume % */}
            <col className="w-[10%]" />  {/* Last Update */}
            <col className="w-[10%]" />  {/* Score */}
          </colgroup>

          <thead className="border-b border-white/20 text-white/70 uppercase">
            <tr>
              <th className="py-2 px-3 text-center">#</th>
              <th className="py-2 px-3">Exchange</th>
              <th className="py-2 px-3">Pair</th>
              <th className="py-2 px-3 text-right">Price (USD)</th>
              <th className="py-2 px-3 text-right">Spread</th>
              <th className="py-2 px-3 text-right">24h Volume (USD)</th>
              <th className="py-2 px-3 text-right">Volume %</th>
              <th className="py-2 px-3 text-center">Last Update</th>
              <th className="py-2 px-3 text-center">Score</th>
            </tr>
          </thead>

          <tbody>
            {displayedTickers.map((ticker, index) => {
              const rowNumber = startIndex + index + 1;
              const volume = ticker.volume || 0;
              const price = ticker.last || 0;
              const volumePercent = ((volume / totalVolume) * 100).toFixed(2);
              const formattedTime = ticker.last_traded_at
                ? new Date(ticker.last_traded_at).toLocaleTimeString("fr-CA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              return (
                <tr
                  key={rowNumber}
                  onClick={() => {
                    if (ticker.trade_url)
                      window.open(ticker.trade_url, "_blank", "noopener,noreferrer");
                  }}
                  className={`border-b border-white/10 transition ${
                    ticker.trade_url
                      ? "hover:bg-white/10 cursor-pointer"
                      : "opacity-70 cursor-default"
                  }`}
                >
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {rowNumber}
                  </td>

                  <td className="py-2 px-3 flex items-center gap-2 truncate">
                    <span className="truncate">{ticker.market.name}</span>
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">
                    {ticker.base}/{ticker.target}
                  </td>

                  <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                    ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                    {ticker.bid_ask_spread_percentage
                      ? `${ticker.bid_ask_spread_percentage.toFixed(2)}%`
                      : "—"}
                  </td>

                  <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                    ${volume.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>

                  <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                    {volumePercent}%
                  </td>

                  <td className="py-2 px-3 text-center text-white/70 whitespace-nowrap">
                    {formattedTime}
                  </td>

                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span
                      className={
                        ticker.trust_score === "green"
                          ? "text-green-400 font-semibold"
                          : ticker.trust_score === "yellow"
                          ? "text-yellow-400 font-semibold"
                          : "text-red-400 font-semibold"
                      }
                    >
                      {ticker.trust_score?.toUpperCase() || "N/A"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2 text-white/80 flex-wrap">
        {/* Prev */}
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 border border-white/20 rounded-md hover:bg-white/10 transition ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          ‹
        </button>

        {getVisiblePages().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => changePage(pageNumber)}
            className={`px-3 py-1 rounded-md border border-white/20 transition ${
              currentPage === pageNumber
                ? "bg-white/20 text-white font-semibold"
                : "hover:bg-white/10"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 border border-white/20 rounded-md hover:bg-white/10 transition ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
