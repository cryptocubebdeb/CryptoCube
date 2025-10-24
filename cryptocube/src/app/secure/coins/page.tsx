'use client'

import { useState, useEffect } from "react"
import { useSession } from 'next-auth/react';
import Button from "@mui/material/Button"; // https://mui.com/material-ui/react-button/
import SearchBar from '../components/SearchBar';
import CoinsTable from '../components/CoinsTable';
import AdvancedFiltersModal from '../components/AdvancedFiltersModal';
import { applyAdvancedFilters, defaultFilters, type FiltersState } from '@/app/lib/filters';
import { CoinData } from '@/app/lib/definitions';
import { getCoinsList } from '../../lib/getCoinsList';
import { fetchWatchlistIds, addToWatchlist, removeFromWatchlist } from '@/app/lib/watchlistActions';

export default function Page() {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(20); // 800 coins = 40 par page * 20 pages
    const [loading, setLoading] = useState(true);
    const [coins, setCoins] = useState<CoinData[]>([]);
    const [activeTab, setActiveTab] = useState('tout');
    const [searchTerm, setSearchTerm] = useState('');
    const [userWatchlist, setUserWatchlist] = useState<Set<string>>(new Set());
    const [watchlistLoading, setWatchlistLoading] = useState(false);
    const [filtersModalOpen, setFiltersModalOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FiltersState>(defaultFilters);

    const fetchCoins = async (category?: string) => {
         try {
            const data = await getCoinsList(category);
            setCoins(data);
        } catch (error) {
            console.error("Error fetching all coins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoins(advancedFilters.category);
    }, [advancedFilters.category]);

    // Tabs filtering
    const getFilteredCoinsByTab = (coinsList: CoinData[], tab: string) => {
        switch (tab) {
            case 'tout':
                return coinsList;
            case 'pluséchangées':
                return [...coinsList]
                    .filter(coin => coin.total_volume && coin.total_volume > 10000000)
                    .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
            case 'gagnants':
                return [...coinsList]
                    .filter(coin => coin.price_change_percentage_24h > 0)
                    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
            default:
                return coinsList;
        }
    };

    // Filtrage combiné onglet + recherche + filtres avancés (doit être défini avant la pagination)
    const tabFilteredCoins = getFilteredCoinsByTab(coins, activeTab);
    const advancedFilteredCoins = applyAdvancedFilters(tabFilteredCoins, advancedFilters, userWatchlist);
    const searchFilteredCoins = advancedFilteredCoins.filter(coin =>
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
    }, [searchTerm, activeTab, coins.length, advancedFilters]);

    // Reset à page 1 quand recherche se fait
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    // Charger la watchlist
    useEffect(() => {
        if (!session?.user?.email) {
            setUserWatchlist(new Set());
            return;
        }
        const loadWatchlist = async () => {
            try {
                const ids = await fetchWatchlistIds();
                setUserWatchlist(new Set(ids));
            } catch (e) {
                console.error('Erreur lors du chargement de la watchlist:', e);
            }
        };
        loadWatchlist();
    }, [session?.user?.email]);

    const toggleWatch = async (e: React.MouseEvent, coinId: string) => {
        e.stopPropagation();
        if (!session?.user?.email) {
            window.location.href = '/auth/login';
            return;
        }
        if (watchlistLoading) return;
        setWatchlistLoading(true);
        try {
            const isIn = userWatchlist.has(coinId);
            const ok = isIn ? await removeFromWatchlist(coinId) : await addToWatchlist(coinId);
            if (ok) {
                setUserWatchlist(prev => {
                    const next = new Set(prev);
                    isIn ? next.delete(coinId) : next.add(coinId);
                    return next;
                });
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la watchlist:', err);
        } finally {
            setWatchlistLoading(false);
        }
    };

    

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
                        {activeTab === 'tout' && 'Liste des cryptomonnaies'}
                        {/* {activeTab === 'tendance' && 'Cryptomonnaies en tendance'} */}
                        {activeTab === 'pluséchangées' && 'Cryptomonnaies les plus échangées'}
                        {activeTab === 'gagnants' && 'Top gagnants (24h)'}
                    </h2>
                    
                    {/* Onglets de navigation */}
                    <div className="flex justify-between items-center mb-5 border-b border-gray-400">
                        <div className="flex space-x-8">
                            {['Tout', 'Plus Échangées', 'Gagnants'].map((tab) => {
                                const tabKey = tab.toLowerCase().replace(' ', '');
                                // Count avec tab filter et search filter
                                const tabFilteredCoins = getFilteredCoinsByTab(coins, tabKey);
                                const searchAndTabFiltered = tabFilteredCoins.filter(coin =>
                                    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                                const tabCount = searchAndTabFiltered.length;
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
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outlined"
                                onClick={() => setFiltersModalOpen(true)}
                                startIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M10 18h4" />
                                    </svg>
                                }
                                sx={{ mt: -1, mb: 1 }}
                            >
                                Filtres 
                            </Button>
                            <Button 
                                variant="outlined"
                                onClick={() => fetchCoins()}
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
                    </div>

                    {/* Tableau des cryptomonnaies */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Chargement des données...</p>
                        </div>
                    ) : (
                        <>
                            <div className="min-h-[2920px]">
                                {filteredCoins.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">Aucun résultat trouvé</div>
                                ) : (
                                    <CoinsTable
                                        coins={filteredCoins}
                                        rankOffset={(currentPage - 1) * 40}
                                        showSparkline={true}
                                        onRowClick={(coinId) => { window.location.href = `/secure/specificCoin/${coinId}`; }}
                                        renderStar={(coinId: string) => (
                                            session?.user?.email ? (
                                                <button
                                                    onClick={(e) => toggleWatch(e, coinId)}
                                                    className={`transition-colors p-1 rounded ${userWatchlist.has(coinId) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'} ${watchlistLoading ? 'opacity-50' : ''}`}
                                                    aria-label={userWatchlist.has(coinId) ? 'Remove from watchlist' : 'Add to watchlist'}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" strokeWidth={1.5}>
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            stroke="currentColor"
                                                            fill={userWatchlist.has(coinId) ? 'currentColor' : 'none'}
                                                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                                        />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <div className="w-5" />
                                            )
                                        )}
                                    />
                                )}
                            </div>

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
                        </>
                    )}
                </div>
            </div>

            {/* Modal des filtres avancés */}
            <AdvancedFiltersModal 
                open={filtersModalOpen}
                onClose={() => setFiltersModalOpen(false)}
                initialValues={advancedFilters}
                onApply={(vals) => setAdvancedFilters(vals)}
            />
        </>
    )
}