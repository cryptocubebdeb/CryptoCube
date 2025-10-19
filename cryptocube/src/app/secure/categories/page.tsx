"use client"

import Link from "next/link"
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useState, useEffect } from "react";
import { getCoinsList } from '../../lib/getCoinsList';
import MiniChart from '../components/Dashboard/MiniChart';

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
    total_volume?: number; // Volume de trading sur 24h
    image: string;
    sparkline_in_7d?: {
        price: number[];  //Données utilisées par MiniChart
    };
}

export default function Page() 
{
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(20); // 800 coins = 40 par page + 20 pages
    const [loading, setLoading] = useState(true);
    const [coins, setCoins] = useState<CoinData[]>([]);

    const fetchCoins = async () => {
        try {
            const data = await getCoinsList();
            setCoins(data);
        } catch (error) {
            console.error("Error fetching all coins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoins();
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

    return ( 
    <>
        <div className="text-center mx-auto space-y-8 mb-15 mt-10">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Catégories de crypto
            </h1>
        </div>

        {/* ======= Filtre de catégories =======*/}
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '3em',
                justifyContent: 'center',
                marginBottom: '4rem',
            }}
        >
            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#232330ff',
                    height: '100px',
                    width: '150px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',      
                }}
            >
                <LocalFireDepartmentOutlinedIcon style={{ width: '35px', height: '35px' }}/>
                <h2 className="font-semibold">Populaires</h2>
            </div>

            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#232330ff',
                    height: '100px',
                    width: '150px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <TrendingUpIcon style={{ width: '35px', height: '35px' }}/>
                <h2 className="font-semibold">Gainers</h2>
            </div>

            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#232330ff',
                    height: '100px',
                    width: '150px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <TrendingDownIcon style={{ width: '35px', height: '35px' }}/>
                <h2 className="font-semibold">Losers</h2>
            </div>
        </div>


        {/* ======= Top catégories =======*/}
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '3em',
                justifyContent: 'center',
                marginBottom: '4rem'
            }}
        >
            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#2d2d3fff',
                    height: '350px',
                    width: '350px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',      
                }}
            >
                {/* Placeholder for future content */}
            </div>

            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#2d2d3fff',
                    height: '350px',
                    width: '350px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',      
                }}
            >
                {/* Placeholder for future content */}
            </div>

            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#2d2d3fff',
                    height: '350px',
                    width: '350px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',      
                }}
            >
                {/* Placeholder for future content */}
            </div>

            <div
                className="hover:scale-105 transform transition-transform duration-200 cursor-pointer"
                style={{
                    backgroundColor: '#2d2d3fff',
                    height: '350px',
                    width: '350px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',      
                }}
            >
                {/* Placeholder for future content */}
            </div>
        </div>


        {/* ======= Liste de catégories =======*/}
        <h1 className="text-xl md:text-2xl font-bold ml-35">
            XX Catégories
        </h1>

        {/* Tableau des cryptomonnaies */}
        {loading ? (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Chargement des données...</p>
            </div>
        ) : (
            <div className="overflow-x-auto min-h-[2920px]">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="border-b border-gray-400">
                            <th className="text-left py-4 px-4 font-medium text-gray-500 w-16">#</th>
                            <th className="text-left py-4 px-4 font-medium text-gray-500 w-64">Nom</th>
                            <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">Prix</th>
                            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">1h %</th>
                            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">24h %</th>
                            <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">7d %</th>
                            <th className="text-right py-4 px-4 font-medium text-gray-500 w-40">Capitalisation</th>
                            <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">Derniers 7 jours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-20 text-center text-gray-500">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="text-4xl"></div>
                                        <p className="text-xl">
                                            Aucune donnée disponible
                                        </p>
                                        <p className="text-sm">
                                            Les cryptomonnaies s'afficheront ici
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <>
                                {coins.map((coin, index) => {
                                    const actualRank = (currentPage - 1) * 40 + index + 1;
                                    return (
                                    <tr 
                                        key={`${coin.id}-${currentPage}-${index}`}
                                        className="border-b border-gray-500 hover:bg-zinc-900 transition-colors cursor-pointer h-[73px]"
                                        onClick={() => window.location.href = `/secure/specificCoin/${coin.id}`}
                                    >
                                    <td className="py-6 px-4 w-16">
                                        <div className="flex items-center space-x-2">
                                            <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                                                
                                            </button>
                                            <span className="font-medium">{actualRank}</span>
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
                                                <div className="text-sm text-gray-500 uppercase">
                                                    {coin.symbol}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-right font-medium w-32">
                                        {formatPrice(coin.current_price)}
                                    </td>
                                    <td className="py-6 px-4 text-right w-24">
                                        {formatPercentage(coin.price_change_percentage_1h_in_currency)}
                                    </td>
                                    <td className="py-6 px-4 text-right w-24">
                                        {formatPercentage(coin.price_change_percentage_24h)}
                                    </td>
                                    <td className="py-6 px-4 text-right w-24">
                                        {formatPercentage(coin.price_change_percentage_7d_in_currency)}
                                    </td>
                                    <td className="py-6 px-4 text-right font-medium w-40">
                                        {formatMarketCap(coin.market_cap)}
                                    </td>
                                    <td className="py-6 px-4 text-center w-32">
                                        <div className="flex justify-end">
                                            <MiniChart 
                                                data={coin.sparkline_in_7d?.price || []} 
                                                isPositive={(coin.price_change_percentage_7d_in_currency || 0) >= 0}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            </>
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
     </>
    )
}