'use client'

import Link from "next/link"
import { useState, useEffect } from "react"

// Interface pour les données de cryptomonnaies
interface CoinData {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d_in_currency?: number;
    market_cap: number;
    image: string;
    sparkline_in_7d?: {
        price: number[];
    };
}

export default function Page() {
    const [coins, setCoins] = useState<CoinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('top');
    const [searchTerm, setSearchTerm] = useState('');

    // Fonction pour récupérer les données de l'API
    const fetchCoins = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d&locale=en'
            );
            const data = await response.json();
            setCoins(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoins();
    }, []);

    // Fonction pour formater les nombres
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price < 1 ? 6 : 2
        }).format(price);
    };

    const formatMarketCap = (marketCap: number) => {
        if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
        if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
        if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
        return `$${marketCap.toLocaleString()}`;
    };

    const formatPercentage = (percentage: number | undefined) => {
        if (percentage === undefined) return 'N/A';
        const isPositive = percentage >= 0;
        return (
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {isPositive ? '▲' : '▼'} {Math.abs(percentage).toFixed(2)}%
            </span>
        );
    };

    // Filtrer les coins selon la recherche
    const filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Hero Section */}
            <div className="min-h-[60vh] flex flex-col justify-center items-center px-4">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                    {/* Main Title */}
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Navigate the World of Crypto with Ease
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl font-light opacity-75">
                        Simple. Fast. Transparent.
                    </p>
                    
                    {/* Barre de recherche */}
                    <div className="max-w-2xl mx-auto mt-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Explore crypto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section des cryptomonnaies */}
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Onglets de navigation */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex space-x-8 border-b border-gray-200">
                            {['Top', 'Trending', 'Most Visited', 'Gainers'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                                    className={`pb-2 px-1 font-medium text-sm transition-colors ${
                                        activeTab === tab.toLowerCase().replace(' ', '')
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Tableau des cryptomonnaies */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Chargement des données...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-4 font-medium text-gray-500">#</th>
                                        <th className="text-left py-4 px-4 font-medium text-gray-500">Name</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">Price</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">1h %</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">24h %</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">7d %</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">Market Cap</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">Last 7 Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCoins.map((coin, index) => (
                                        <tr key={coin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-gray-400 hover:text-yellow-500">
                                                        ⭐
                                                    </button>
                                                    <span className="font-medium">{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <img 
                                                        src={coin.image} 
                                                        alt={coin.name}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                    <div>
                                                        <div className="font-medium">{coin.name}</div>
                                                        <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right font-medium">
                                                {formatPrice(coin.current_price)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {formatPercentage(coin.price_change_percentage_1h_in_currency)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {formatPercentage(coin.price_change_percentage_24h)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                                            </td>
                                            <td className="py-4 px-4 text-right font-medium">
                                                {formatMarketCap(coin.market_cap)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="w-20 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                    📈
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}