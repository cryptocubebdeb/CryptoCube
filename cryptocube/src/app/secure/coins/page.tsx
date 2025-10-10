'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import SearchBar from '../components/SearchBar';
import MiniChart from '../components/Dashboard/MiniChart';
import Button from "@mui/material/Button"; // https://mui.com/material-ui/react-button/
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Interface pour les données de cryptomonnaies
interface CoinData {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d_in_currency?: number; // Pour isPositive (MiniChart)
    market_cap: number;
    image: string;
    sparkline_in_7d?: {
        price: number[];  //Données utilisées par MiniChart
    };
}

export default function Page() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(20); // 800 coins = 40 par page + 20 pages
    const [allCoins, setAllCoins] = useState<CoinData[]>([]); // Store 800 coins
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tout');
    const [searchTerm, setSearchTerm] = useState('');

    // Fonction combinée pour récupérer tous les coins (800 au total)
    const fetchAllCoins = async () => {
        try {
            setLoading(true);
            
            // Fetch 800 coins
            // Limite de 250 par api fetch
            const fetchPromises = [
                fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d&locale=en`),
                fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2&sparkline=true&price_change_percentage=1h%2C24h%2C7d&locale=en`),
                fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=3&sparkline=true&price_change_percentage=1h%2C24h%2C7d&locale=en`),
                fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=4&sparkline=true&price_change_percentage=1h%2C24h%2C7d&locale=en`)
            ];

            const responses = await Promise.all(fetchPromises);
            
            // Vérification du fetch
            for (let i = 0; i < responses.length; i++) {
                if (!responses[i].ok) {
                    throw new Error(`HTTP error! status: ${responses[i].status} for page ${i + 1}`);
                }
            }

            // Parse tous les reponses
            const dataPromises = responses.map(response => response.json());
            const [data1, data2, data3, data4] = await Promise.all(dataPromises);
            
            // Combine tout le data en un
            const allData = [...data1, ...data2, ...data3, ...data4];
            setAllCoins(allData);
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCoins();
    }, []);

    // Fonction pour formater les prix
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price < 1 ? 6 : 2
        }).format(price);
    };

    // Fonction pour formater la market cap
    const formatMarketCap = (marketCap: number) => {
        if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
        if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
        if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
        return `$${marketCap.toLocaleString()}`;
    };

    // Fonction pour formater les pourcentages avec couleurs
    const formatPercentage = (percentage: number | undefined) => {
        if (percentage === undefined) return <span className="text-gray-400">N/A</span>;
        const isPositive = percentage >= 0;
        return (
            <span className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? (
                    <TrendingUpIcon sx={{ fontSize: '1rem' }} />
                ) : (
                    <TrendingDownIcon sx={{ fontSize: '1rem' }} />
                )}
                {Math.abs(percentage).toFixed(2)}%
            </span>
        );
    };

    // Fonction pour filtrer selon l'onglet actif
    const getFilteredCoinsByTab = (coins: CoinData[], tab: string) => {
        switch (tab) {
            case 'tout':
                return coins; // Par défaut, déjà trié par market cap
            case 'tendance':
                //Coins avec le plus de changement de volume (simulation)
                return [...coins].sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h));
            case 'plusvisitées':
                //coins les plus populaires (par market cap - maintenant tous les 800 coins)
                return [...coins].sort((a, b) => b.market_cap - a.market_cap);
            case 'gagnants':
                // Coins avec les meilleurs gains sur 24h
                return [...coins]
                    .filter(coin => coin.price_change_percentage_24h > 0)
                    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
            default:
                return coins;
        }
    };

    // Filtrer les coins selon l'onglet actif puis selon la recherche
    const tabFilteredCoins = getFilteredCoinsByTab(allCoins, activeTab);
    const searchFilteredCoins = tabFilteredCoins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination - 40 coins par page
    const getCurrentPageCoins = () => {
        const startIndex = (currentPage - 1) * 40;
        const endIndex = startIndex + 40;
        return searchFilteredCoins.slice(startIndex, endIndex);
    };

    const filteredCoins = getCurrentPageCoins();

    // Update le total des pages quand la recherche ou l'onglet change
    useEffect(() => {
        const totalResults = searchFilteredCoins.length;
        setTotalPages(Math.ceil(totalResults / 40));
    }, [searchTerm, activeTab, allCoins.length]);

    // Reset à page 1 quand recherche se fait
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    return (
        <>
            {/* Hero Section */}
            <div className="min-h-[60vh] flex flex-col justify-center items-center px-4">
                <div className="text-center mx-auto space-y-8">
                    {/* Main Title */}
                    <h1 className="text-4xl max-w-6xl md:text-5xl font-bold leading-tight">
                        Naviguez dans le monde de la cryptomonnaie en toute simplicité.
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl font-light opacity-75">
                        Simple. Rapide. Transparent.
                    </p>
                    
                    {/* Barre de recherche */}
                    <SearchBar 
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Explore crypto..."
                    />

                </div>
            </div>

            {/* Section des cryptomonnaies */}
            <div className="min-h-screen">
                <div className="max-w-[85rem] mx-auto">
                    {/* Titre Overview */}
                    <h2 className="text-4xl font-bold mb-10">
                        {activeTab === 'tout' && 'Tous cryptomonnaies'}
                        {activeTab === 'tendance' && 'Cryptomonnaies en tendance'}
                        {activeTab === 'plusvisitées' && 'Cryptomonnaies les plus visitées'}
                        {activeTab === 'gagnants' && 'Top gagnants'}
                    </h2>
                    
                    {/* Onglets de navigation */}
                    <div className="flex justify-between items-center mb-5 border-b border-gray-400">
                        <div className="flex space-x-8">
                            {['Tout', 'Tendance', 'Plus Visitées', 'Gagnants'].map((tab) => {
                                const tabKey = tab.toLowerCase().replace(' ', '');
                                const tabCount = getFilteredCoinsByTab(allCoins, tabKey).length;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tabKey)}
                                        className={`pb-4 px-1 text-md transition-colors ${
                                            activeTab === tabKey
                                                ? 'border-b-2 border-blue-500 text-blue-600'
                                                : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {tab}
                                        <span className="ml-1 text-xs opacity-60">({tabCount})</span>
                                    </button>
                                );
                            })}
                        </div>
                        <Button 
                            variant="outlined"
                            onClick={() => fetchAllCoins()}
                            startIcon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            }
                            sx={{ mt: -1, mb: 1 }}
                        >
                            Refresh
                        </Button>
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
                                    <tr className="border-b border-gray-400">
                                        <th className="text-left py-4 px-4 font-medium text-gray-500">#</th>
                                        <th className="text-left py-4 px-4 font-medium text-gray-500">Nom</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">Prix</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">1h %</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">24h %</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">7d %</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">Capitalisation</th>
                                        <th className="text-right py-4 px-4 font-medium text-gray-500">Derniers 7 jours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCoins.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-20 text-center text-gray-500">
                                                <div className="flex flex-col items-center space-y-4">
                                                    <div className="text-4xl"></div>
                                                    <p className="text-xl">
                                                        {searchTerm ? 'Aucun résultat trouvé' : 'Aucune donnée disponible'}
                                                    </p>
                                                    <p className="text-sm">
                                                        {searchTerm ? 'Essayez un autre terme de recherche' : 'Les cryptomonnaies s\'afficheront ici'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCoins.map((coin, index) => {
                                            const actualRank = (currentPage - 1) * 40 + index + 1;
                                            return (
                                            <tr 
                                                key={`${coin.id}-${currentPage}-${index}`}
                                                className="border-b border-gray-500 hover:bg-zinc-900 transition-colors cursor-pointer"
                                                onClick={() => window.location.href = `/secure/specificCoin/${coin.id}`}
                                            >
                                                <td className="py-6 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                                                            
                                                        </button>
                                                        <span className="font-medium">{actualRank}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <img 
                                                            src={coin.image} 
                                                            alt={coin.name}
                                                            className="w-8 h-8 rounded-full"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjwvc3ZnPg==';
                                                            }}
                                                        />
                                                        <div className="flex flex-row items-baseline gap-2">
                                                            <div className="font-medium">{coin.name}</div>
                                                            <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-right font-medium">
                                                    {formatPrice(coin.current_price)}
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    {formatPercentage(coin.price_change_percentage_1h_in_currency)}
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    {formatPercentage(coin.price_change_percentage_24h)}
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                                                </td>
                                                <td className="py-6 px-4 text-right font-medium">
                                                    {formatMarketCap(coin.market_cap)}
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <div className="flex justify-end">
                                                        <MiniChart 
                                                            data={coin.sparkline_in_7d?.price || []} 
                                                            isPositive={(coin.price_change_percentage_7d_in_currency || 0) >= 0}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )})
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-center items-center space-x-4 my-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded transition-transform ${currentPage === 1 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-white hover:scale-125'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                {(() => {
                                    const pages = [];
                                    const startPage = Math.max(1, currentPage - 2);
                                    const endPage = Math.min(totalPages, currentPage + 2);

                                    // Première page
                                    if (startPage > 1) {
                                        pages.push(
                                            <button
                                                key={1}
                                                onClick={() => setCurrentPage(1)}
                                                className="px-3 py-1 rounded border border-transparent text-blue-500 hover:border-blue-500"
                                            >
                                                1
                                            </button>
                                        );
                                        if (startPage > 2) {
                                            pages.push(<span key="dots1" className="px-2 text-gray-400">...</span>);
                                        }
                                    }

                                    // Milieu
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i)}
                                                className={`px-3 py-1 rounded border ${i === currentPage 
                                                    ? 'bg-blue-500 text-white border-blue-500' 
                                                    : 'text-blue-500 border-transparent hover:border-blue-500'
                                                }`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }

                                    // Dernière page
                                    if (endPage < totalPages) {
                                        if (endPage < totalPages - 1) {
                                            pages.push(<span key="dots2" className="px-2 text-gray-400">...</span>);
                                        }

                                        pages.push(
                                            <button
                                                key={totalPages}
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="px-3 py-1 rounded border border-transparent text-blue-500 hover:border-blue-500"
                                            >
                                                {totalPages}
                                            </button>
                                        );
                                    }

                                    return pages;
                                })()}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded transition-transform ${currentPage === totalPages 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-white hover:scale-125'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}