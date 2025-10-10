"use client"
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Divider } from '@mui/material';
import { getMarketData } from '../../../lib/getMarketData';

// Type for market data
interface MarketData {
    data: {
        market_cap_change_percentage_24h_usd: number;
        total_market_cap: {
            usd: number;
        };
    };
}

export default function CircularMarketMeter(): React.JSX.Element {
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMarketData() {
            try {
                const data = await getMarketData();
                setMarketData(data);
            } catch (error) {
                console.error("Error fetching market data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMarketData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress size={24} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    if (!marketData) {
        return (
            <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>
                Failed to load market data.
            </Typography>
        );
    }

    // Calculation du market cap en pourcentage
    const marketCapChangePercentage = marketData.data.market_cap_change_percentage_24h_usd || 0;
    const sentiment = Math.max(0, Math.min(100, 50 + marketCapChangePercentage * 2));

    // Déterminer couleur en fonction du sentiment
    const getColor = (value: number) => {
        if (value < 30) return '#ff4d4d'; // Rouge pour négatif
        if (value < 70) return '#ffcc00'; // Jaune pour neutre
        return '#4caf50'; // Vert pour positif
    };

    const getSentimentText = (value: number) => {
        if (value < 30) return 'Négatif';
        if (value < 70) return 'Neutre';
        return 'Positif';
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            py: 2,
            width: '100%',
            }}
        >
            <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', mb: 2 }}>
                    État du marché
                </Typography>

                {/* Variation de la capitalisation */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                        Variation de la capitalisation (24h)
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 600, color: marketCapChangePercentage >= 0 ? '#4caf50' : '#ff4d4d' }}>
                        {marketCapChangePercentage.toFixed(2)}%
                    </Typography>
                </Box>

                {/* Capitalisation totale du marché */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                        Capitalisation totale du marché
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 600, color: marketCapChangePercentage >= 0 ? '#4caf50' : '#ff4d4d' }}>
                        ${(marketData.data.total_market_cap?.usd / 1e12).toFixed(2)}T
                    </Typography>
                </Box>
            </Box>

            {/* Séparateur */}
            <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'stretch', height: '200px' }} 
            />

            {/* Cercle de sentiment */}
            <Box sx={{ flex: 1, mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', mr: 3, display: 'inline-flex' }}>
                    <CircularProgress
                        variant="determinate"
                        value={sentiment}
                        size={150}
                        thickness={8}
                        sx={{
                            color: getColor(sentiment),
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            },
                        }}
                    />
                    
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h6" component="div" color="white">
                            {Math.round(sentiment)}%
                        </Typography>

                        <Typography variant="caption" sx={{ color: getColor(sentiment) }}>
                            {getSentimentText(sentiment)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            
        </Box>
    );
}