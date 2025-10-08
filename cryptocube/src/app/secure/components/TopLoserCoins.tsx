"use client"
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Avatar, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getTopCoins } from '../../lib/getTopCoins';

interface Coin {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
}

export default function TopLoserCoins(): React.JSX.Element {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCoins() {
            try {
                const data = await getTopCoins();
                // get top losing coins
                const sortedData = data.sort((a: Coin, b: Coin) => a.price_change_percentage_24h - b.price_change_percentage_24h);
                setCoins(sortedData);
            } catch (error) {
                console.error("Error fetching top coins:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCoins();
    }, []);

    if (loading) {
        return (
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'white' }}>
                Loading top losing coins...
            </Typography>
        );
    }

    if (!coins.length) {
        return (
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'error.main' }}>
                Failed to load top losing coins.
            </Typography>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            {coins.slice(0, 3).map((coin, index) => (
                <Box
                    key={coin.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginLeft: 1,
                        py: 2,
                        borderBottom: index < 2 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}
                >
                    {/* Logo, nom et symbole */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                            src={coin.image} 
                            alt={coin.name} 
                            sx={{ width: 32, height: 32 }} 
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                                {coin.name}
                            </Typography>

                            <Typography variant="body1" sx={{ color: 'gray' }}>
                                {coin.symbol.toUpperCase()}
                            </Typography>
                        </Box>
                    </Box>

                {/* Prix actuel et changement */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                        ${coin.current_price.toFixed(2)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: 2.5 }}>
                        {coin.price_change_percentage_24h >= 0 ? (
                            <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '1rem' }} />
                        ) : (
                            <TrendingDownIcon sx={{ color: '#f44336', fontSize: '1rem' }} />
                        )}

                        <Typography
                            variant="body1"
                            sx={{ color: coin.price_change_percentage_24h >= 0 ? '#4caf50' : '#f44336' }}
                        >
                            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                        </Typography>
                    </Box>
                </Box>
            </Box>
        ))}
        </Box>
    );
}