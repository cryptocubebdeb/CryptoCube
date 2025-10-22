"use client"

import Link from "next/link"
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useState, useEffect } from "react";
import { getCategories, getCategoryAssetCount } from '../../lib/getCategories';
import MiniChart from '../components/Dashboard/MiniChart';
import { getFormatMarketCap, getFormatPercentage } from "../../lib/getFormatData";


// Interface pour les données de cryptomonnaies
interface CategoryData {
    id: string;
    name: string;
    top_3_coins: string[];
    asset_count?: number;
    market_cap_change_24h: number;
    market_cap_change_7d?: number;
    market_cap_change_30d?: number;
    volume_24h: number;
    market_cap: number;
    sparkline_in_30d?: {
        price: number[];  // Pour chart data
    };
}


export default function Page() 
{
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(16); // 624 catégories / 40 par page  = 16 pages
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [activeTopTab, setActiveTopTab] = useState('populaires');

    const fetchCategories = async () => {
        try {
            const data = await getCategories();

            // Filtrer les catégories avec aucun data
            const filtered = data.filter((category: any) => {
                return !(category.market_cap === null || category.volume_24h === null || (!category.top_3_coins || category.top_3_coins.length === 0));
            });
            setCategories(filtered);
        } catch (error) {
            console.error("Error fetching coin categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Fonction pour formater les pourcentages avec couleurs
    const formatPercentage = (percentage: number | undefined) => {
        const result = getFormatPercentage(percentage);

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

    const getFilteredCategoriesByTab = (categories: CategoryData[], tab: string) => {
        switch (tab) {
            case 'populaires':
                return [...categories]
                    .sort((first, second) => second.market_cap - first.market_cap)
                    .slice(0, 4);
            case 'gainers':
                return [...categories]
                    .sort((first, second) => second.market_cap_change_24h - first.market_cap_change_24h)
                    .slice(0, 4);
            case 'losers':
                return [...categories]
                    .sort((first, second) => first.market_cap_change_24h - second.market_cap_change_24h)
                    .slice(0, 4);
            default:
                return categories;
        }
    };

    const topPopulaires = getFilteredCategoriesByTab(categories, 'populaires');
    const topGainers = getFilteredCategoriesByTab(categories, 'gainers');
    const topLosers = getFilteredCategoriesByTab(categories, 'losers');

    const topSections = [
        {
            title: 'Populaires',
            icon: <LocalFireDepartmentOutlinedIcon style={{ width: '35px', height: '35px' }}/>,
            data: topPopulaires
        },
        {
            title: 'Gainers',
            icon: <TrendingUpIcon style={{ width: '35px', height: '35px' }}/>,
            data: topGainers
        },
        {
            title: 'Losers',
            icon: <TrendingDownIcon style={{ width: '35px', height: '35px' }}/>,
            data: topLosers
        }
    ];


    // Pagination - 40 catégories par page
    const getCurrentPageCategories = () => {
        const startIndex = (currentPage - 1) * 40;
        const endIndex = startIndex + 40;
        return categories.slice(startIndex, endIndex);
    }

    useEffect(() => {
        const total = Math.ceil(categories.length / 40);
        setTotalPages(total);
    }, [categories]);

    return ( 
    <>
        <div className="text-center mx-auto space-y-8 mb-15 mt-10">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Catégories de crypto
            </h1>
        </div>

        {/* ======= Filtre de catégories & Top catégories =======*/}
        <div>
            {/* Filter Tabs */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '3em',
                    justifyContent: 'center',
                    marginBottom: '4rem',
                }}
            >
                {topSections.map((section) => {
                    const isActive = activeTopTab === section.title.toLowerCase();
                    return(
                        <div
                            key={section.title}
                            className={`hover:scale-105 transform transition-transform duration-200 cursor-pointer`}
                            style={{
                                backgroundColor: isActive ? '#232330ff' : '#303039ff',
                                color: isActive ? 'white' : 'gray',
                                borderColor: isActive ? '#2d2d3fff' : 'transparent',
                                borderWidth: isActive ? '3px' : '0px',
                                height: '100px',
                                width: '150px',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => setActiveTopTab(section.title.toLowerCase())}
                        >
                            {section.icon}
                            <h2 className="font-semibold">{section.title}</h2>
                        </div>
                    );
                })}
            </div>

            {/* Top Categories for Selected Tab */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '3em',
                    justifyContent: 'center',
                    marginBottom: '6rem'
                }}
            >
                {topSections.find(section => section.title.toLowerCase() === activeTopTab)?.data.map((category) => (
                    <div
                        key={category.id}
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
                        <h3 className="font-semibold">{category.name}</h3>
                        {/* Add more details here if needed */}
                    </div>
                ))}
            </div>
        </div>


        {/* ======= Liste de catégories =======*/}
        <div className="min-h-screen">
            <div className="max-w-[95rem] mx-auto">
                <h1 className="text-xl md:text-2xl font-bold mb-10">
                     {categories.length} Catégories
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
                                    <th className="text-left py-4 px-4 font-medium text-gray-500 w-64">Catégorie</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-40">Top coins</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-32"># de contenus</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">24h %</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">7d %</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-24">30d %</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">Volume 24h</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-32">Market Cap</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500 w-40">Dernier 30 jours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-20 text-center text-gray-500">
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="text-4xl"></div>
                                                <p className="text-xl">
                                                    Aucune donnée disponible
                                                </p>
                                                <p className="text-sm">
                                                    Les catégories s'afficheront ici
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {getCurrentPageCategories().map((category, index) => {
                                            const actualRank = (currentPage - 1) * 40 + index + 1;
                                            return (
                                            <tr 
                                                key={`${category.id}-${currentPage}-${index}`}
                                                className="border-b border-gray-500 hover:bg-zinc-900 transition-colors cursor-pointer h-[73px]"
                                                // onClick={() => window.location.href = `/secure/coins`}
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
                                                    <div className="font-medium truncate max-w-[300px]" title={category.name}>
                                                        {category.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-right w-40">
                                                <div className="flex justify-end items-center">
                                                    {category.top_3_coins && category.top_3_coins.length > 0 ? (
                                                        <div className="flex -space-x-2">
                                                            {category.top_3_coins.slice(0, 3).map((coinUrl, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={coinUrl}
                                                                    alt={`Coin ${index + 1}`}
                                                                    className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-900"
                                                                    style={{ zIndex: 3 - index }}
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}                                                          
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">No coins</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-6 px-4 text-right w-24">
                                                {category.asset_count !== undefined ? category.asset_count : 'N/A'}
                                            </td>
                                            <td className="py-6 px-4 text-right w-24">
                                                {formatPercentage(category.market_cap_change_24h)}
                                            </td>
                                            <td className="py-6 px-4 text-right w-24">
                                                {formatPercentage(category.market_cap_change_7d)}
                                            </td>
                                            <td className="py-6 px-4 text-right w-24">
                                                {formatPercentage(category.market_cap_change_30d)}
                                            </td>
                                            <td className="py-6 px-4 text-right w-32">
                                                {getFormatMarketCap(category.volume_24h)}
                                            </td>
                                            <td className="py-6 px-4 text-right font-medium w-32">
                                                {getFormatMarketCap(category.market_cap)}
                                            </td>
                                            <td className="py-6 px-4 text-center w-40">
                                                <div className="flex justify-end">
                                                    <MiniChart
                                                        data={category.sparkline_in_30d?.price || []}
                                                        isPositive={(category.market_cap_change_30d || 0) >= 0}
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
            </div>
        </div>
     </>
    )
}