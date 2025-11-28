"use client";

import React from 'react';
import { useTranslation } from "react-i18next";
import { CoinData } from '@/app/lib/definitions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MiniChart from './Dashboard/MiniChart';
import { getFormatPrix, getFormatMarketCap, getFormatPercentage } from '@/app/lib/getFormatData';

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

  const { t } = useTranslation();
  const isClickable = typeof onRowClick === 'function';

  // Fonction pour formater les pourcentages avec couleurs
  const formatPercentage = (value: number | undefined) => {
      const result = getFormatPercentage(value);

      if (result.isPositive === null) return <span className="text-gray-400">{result.value}</span>;
      
      return (
          <span className={`flex items-center justify-end gap-1 ${result.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {result.isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} />
              ) : (
                  <TrendingDownIcon sx={{ fontSize: '1rem' }} />
              )}
              {result.value}
          </span>
      );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-4 px-4 font-medium text-gray-500 w-16">#</th>
            <th className="text-left py-4 px-4 font-medium text-gray-500 w-64">
              {t("coinsTable.name")}
            </th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">
              {t("coinsTable.price")}
            </th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">
              {t("coinsTable.oneHour")}
            </th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">
              {t("coinsTable.twentyFourHours")}
            </th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">
              {t("coinsTable.sevenDays")}
            </th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-40">
              {t("coinsTable.marketCap")}
            </th>
            <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">
              {t("coinsTable.last7days")}
            </th>
          </tr>
        </thead>
        <tbody>
          {coins.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-20 text-center text-gray-500">
                {t("coinsTable.noData")}
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
                <td className="py-6 px-4 text-right font-medium w-32">{getFormatPrix(coin.current_price)}</td>
                <td className="py-6 px-4 text-right w-24">
                  {formatPercentage(coin.price_change_percentage_1h_in_currency)}
                </td>
                <td className="py-6 px-4 text-right w-24">
                  {formatPercentage(coin.price_change_percentage_24h)}
                </td>
                <td className="py-6 px-4 text-right w-24">
                  {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                </td>
                <td className="py-6 px-4 text-right font-medium w-40">{getFormatMarketCap(coin.market_cap)}</td>
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
