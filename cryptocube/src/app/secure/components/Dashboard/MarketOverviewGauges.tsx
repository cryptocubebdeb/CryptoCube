"use client"
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import RiskGauge from '../GaugeComponent/RiskGauge';

export default function MarketOverviewGauges(): React.JSX.Element {
    const [fearGreedValue, setFearGreedValue] = useState<number>(50);
    const [fearGreedLabel, setFearGreedLabel] = useState<string>('Loading...');
    const [marketHealth, setMarketHealth] = useState<number>(50);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMarketData() {
            try {
                // Fetch Fear & Greed Index
                const fearGreedRes = await fetch("https://api.alternative.me/fng/");
                const { data } = await fearGreedRes.json();
                const fearGreedVal = parseInt(data[0].value);
                const fearGreedLbl = data[0].value_classification;

                // Fetch Global Market Data
                const globalRes = await fetch("https://api.coingecko.com/api/v3/global");
                const { data: g } = await globalRes.json() ?? {};
                const marketCapChange = Number.isFinite(Number(g?.market_cap_change_percentage_24h_usd))
                    ? Number(g.market_cap_change_percentage_24h_usd)
                    : 0;
                const marketHealthVal = Math.min(100, Math.max(0, 50 + marketCapChange));

                setFearGreedValue(fearGreedVal);
                setFearGreedLabel(fearGreedLbl);
                setMarketHealth(marketHealthVal);
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
                <Typography variant="body2" sx={{ color: 'white' }}>
                    Chargement des données du marché...
                </Typography>
            </Box>
        );
    }

    const getMarketStatus = (health: number) => {
        if (health >= 55) return "En croissance";
        if (health <= 45) return "En repli";
        return "Stable";
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 4,
            py: 2,
            width: '100%',
            height: '100%'
        }}>
            {/* Fear & Greed Gauge */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontSize: '18px' , color: 'white', mb: -1.5, textAlign: 'center' }}>
                    Sentiment du marché
                </Typography>
                <RiskGauge value={Math.round(fearGreedValue)} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: -1, textAlign: 'center' }}>
                    {fearGreedLabel}
                </Typography>
            </Box>

            {/* Global Market Gauge */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontSize: '18px', color: 'white', mb: -1.5, textAlign: 'center' }}>
                    Marché global
                </Typography>
                <RiskGauge value={Math.round(marketHealth)} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: -1, textAlign: 'center' }}>
                    {getMarketStatus(marketHealth)}
                </Typography>
            </Box>
        </Box>
    );
}