"use client";

import React from 'react';
import { CoinData } from '@/app/lib/definitions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MiniChart from './Dashboard/MiniChart';

export interface CoinsTableProps {
  coins: CoinData[];
  rankOffset?: number; // e.g., (currentPage - 1) * pageSize
  onRowClick?: (coinId: string) => void;
  renderStar?: (coinId: string) => React.ReactNode; // fully controlled star cell content
  showSparkline?: boolean;
}

export default function CoinsTable({
  coins,
  rankOffset = 0,
  onRowClick,
  renderStar,
  showSparkline = true,
}: CoinsTableProps) {
  const isClickable = typeof onRowClick === 'function';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const Percent = ({ value }: { value: number | undefined }) => {
    if (value === undefined) return <span className="text-gray-400">N/A</span>;
    const positive = value >= 0;
    return (
      <span className={`flex items-center justify-end gap-1 ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {positive ? (
          <TrendingUpIcon sx={{ fontSize: '1rem' }} />
        ) : (
          <TrendingDownIcon sx={{ fontSize: '1rem' }} />
        )}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-4 px-4 font-medium text-gray-500 w-16">#</th>
            <th className="text-left py-4 px-4 font-medium text-gray-500 w-64">Nom</th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">Prix</th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">1h</th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">24h</th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">7j</th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-40">Capitalisation</th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">Derniers 7 jours</th>
          </tr>
        </thead>
        <tbody>
          {coins.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-20 text-center text-gray-500">
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            coins.map((coin, index) => (
              <tr
                key={coin.id}
                className={`border-b border-gray-500 ${isClickable ? 'hover:bg-zinc-900 transition-colors cursor-pointer' : ''} h-[73px]`}
                onClick={() => isClickable && onRowClick && onRowClick(coin.id)}
              >
                <td className="py-6 px-4 w-16">
                  <div className="flex items-center space-x-2">
                    {renderStar ? (
                      renderStar(coin.id)
                    ) : (
                      <div className="w-5" />
                    )}
                    <span className="font-medium">{rankOffset + index + 1}</span>
                  </div>
                </td>
                <td className="py-6 px-4 w-64">
                  <div className="flex items-center space-x-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjwvc3ZnPg==';
                      }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="font-medium truncate max-w-[200px]" title={coin.name}>
                        {coin.name}
                      </div>
                      <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="py-6 px-4 text-right font-medium w-32">{formatPrice(coin.current_price)}</td>
                <td className="py-6 px-4 text-right w-24">
                  <Percent value={coin.price_change_percentage_1h_in_currency} />
                </td>
                <td className="py-6 px-4 text-right w-24">
                  <Percent value={coin.price_change_percentage_24h} />
                </td>
                <td className="py-6 px-4 text-right w-24">
                  <Percent value={coin.price_change_percentage_7d_in_currency} />
                </td>
                <td className="py-6 px-4 text-right font-medium w-40">{formatMarketCap(coin.market_cap)}</td>
                <td className="py-6 px-4 text-center w-32">
                  {showSparkline && (
                    <div className="flex justify-end">
                      <MiniChart
                        data={coin.sparkline_in_7d?.price || []}
                        isPositive={(coin.price_change_percentage_7d_in_currency || 0) >= 0}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
