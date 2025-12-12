"use client";

import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import MiniChart from "./MiniChart";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

export default function TopWinningCoins(): React.JSX.Element {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchCoins() {
    try {
      // this must match the folder you created: /api/home/gainers
      const response = await fetch("/api/home/gainers");

      if (!response.ok) {
        throw new Error("Failed to fetch /api/home/gainers");
      }

      const jsonData = await response.json();

<<<<<<< HEAD
    if (loading) {
        return (
            // squelettes - placeholders bleus translucides
            <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center justify-between p-2 rounded animate-pulse" style={{ backgroundColor: 'rgba(59,130,246,0.04)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.06)' }} />
                            <div className="space-y-1">
                                <div className="h-4 w-40 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.06)' }} />
                                <div className="h-3 w-20 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.06)' }} />
                            </div>
                        </div>
                        <div className="h-4 w-14 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.06)' }} />
                    </div>
                ))}
            </div>
        );
=======
      // your API returns { coins: [...] }
      const coinsArray = Array.isArray(jsonData.coins) ? jsonData.coins : [];

      // just in case the API is not sorted, we keep your old sorting logic
      const sortedCoins = coinsArray.sort(
        (first: Coin, second: Coin) =>
          (second.price_change_percentage_24h || 0) -
          (first.price_change_percentage_24h || 0)
      );

      setCoins(sortedCoins);
    } catch (error) {
      console.error("Error fetching top coins:", error);
      setCoins([]);
    } finally {
      setLoading(false);
>>>>>>> bbe19c8cfa87076a42bc90d43443e398abdc4101
    }
  }

  fetchCoins();
}, []);

    return (
        <Box sx={{ pt: 1 }}>
            {coins.slice(0, 5).map((coin, index) => (
                <Box
                    key={coin.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginLeft: 1,
                        paddingLeft: 2,
                        paddingRight: 2,
                        py: 2,
                        borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'var(--background-hover)',
                        },
                        transition: 'background-color 0.2s ease',
                    }}
                    onClick={() => window.location.href = `/secure/specificCoin/${coin.id}`}
                >
                    {/* Logo, nom et symbole */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                            src={coin.image} 
                            alt={coin.name} 
                            sx={{ width: 32, height: 32 }} 
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: "var(--foreground)" }}>
                                {coin.name}
                            </Typography>

                            <Typography variant="body1" sx={{ color: "var(--foreground-grey)" }}>
                                {coin.symbol.toUpperCase()}
                            </Typography>
                        </Box>
                    </Box>

                {/* Prix actuel et changement */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: "var(--foreground)" }}>
                        ${coin.current_price.toFixed(2)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: 2, marginRight: 2 }}>
                        {coin.price_change_percentage_24h >= 0 ? (
                            <TrendingUpIcon sx={{ color: 'var(--color-green)', fontSize: '1rem' }} />
                        ) : (
                            <TrendingDownIcon sx={{ color: 'var(--color-red)', fontSize: '1rem' }} />
                        )}

                        <Typography
                            variant="body1"
                            sx={{ color: coin.price_change_percentage_24h >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}
                        >
                            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                        </Typography>
                    </Box>

                    <MiniChart
                        data={coin.sparkline_in_7d?.price || []}
                        isPositive={(coin.price_change_percentage_24h || 0) >= 0}
                        timeframe="24h"
                    />
                </Box>
            </Box>
          </Box>

          {/* Right: price + change */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, color: "white" }}>
              ${coin.current_price.toFixed(2)}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                marginLeft: 2,
                marginRight: 2,
              }}
            >
              {coin.price_change_percentage_24h >= 0 ? (
                <TrendingUpIcon sx={{ color: "#4caf50", fontSize: "1rem" }} />
              ) : (
                <TrendingDownIcon sx={{ color: "#f44336", fontSize: "1rem" }} />
              )}

              <Typography
                variant="body1"
                sx={{
                  color:
                    coin.price_change_percentage_24h >= 0
                      ? "#4caf50"
                      : "#f44336",
                }}
              >
                {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </Typography>
            </Box>

            <MiniChart
              data={coin.sparkline_in_7d?.price || []}
              isPositive={(coin.price_change_percentage_24h || 0) >= 0}
              timeframe="24h"
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
