'use client'

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Button from "@mui/material/Button"; // référence Material UI : https://mui.com/material-ui/react-button/
import SearchBar from '../components/SearchBar';
import CoinsTable from '../components/CoinsTable';
import AdvancedFiltersModal from '../components/AdvancedFiltersModal';
import { applyAdvancedFilters, defaultFilters, type FiltersState } from '@/app/lib/filters';
import { CoinData, CategoryData } from '@/app/lib/definitions';
import { getCoinsList } from '../../lib/getCoinsList';
import { getCategories } from '../../lib/getCategories';
import { getFormatMarketCap, getFormatPercentage } from '@/app/lib/getFormatData';
import { buildSparklinePoints, aggregateSparklines} from '@/app/lib/sparkline';
import { computeTotalMarketCapChangePercent } from '@/app/lib/marketCap';
import { getFormatMarketCap, getFormatPercentage, getFormatPrix } from '@/app/lib/getFormatData';
import { fetchWatchlistIds, addToWatchlist, removeFromWatchlist } from '@/app/lib/watchlistActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';


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
    const [categoryDetails, setCategoryDetails] = useState<CategoryData | null>(null);
    const [refreshCooldown, setRefreshCooldown] = useState(false);
    const [cooldownProgress, setCooldownProgress] = useState(0);
    const cooldownDuration = 10000; // milliseconds in 10 seconds
    const animationRef = useRef<number | null>(null); // Pour l'animation du bouton
    const searchParams = useSearchParams();
    const category = searchParams.get('category');

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

    // Récupère les coins au montage et quand la catégorie ou advancedFilters.category change
    const effectiveCategory = category || advancedFilters.category;

    useEffect(() => {
        fetchCoins(effectiveCategory);
    }, [effectiveCategory]);

    // Pour fetch info du catégorie
    useEffect(() => {
        if (!effectiveCategory) {
            setCategoryDetails(null);
            return;
        }

        const fetchCategoryDetails = async () => {
            const allCategories: CategoryData[] = await getCategories();
            const matchCategory = allCategories.find((cat: CategoryData) => cat.id === category);
            setCategoryDetails(matchCategory || null);
        };

        fetchCategoryDetails();
    }, [category]);

    // Sections haut : calculer les top 3 gagnants (24h) et top 3 par volume
    const topGainers = React.useMemo(() => {
        return [...coins]
            .filter(c => typeof c.price_change_percentage_24h === 'number')
            .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
            .slice(0, 3);
    }, [coins]);

    // Top 3 par volume 
    const topTraded = React.useMemo(() => {
        return [...coins]
            .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
            .slice(0, 3); //3 premiers
    }, [coins]);

    const router = useRouter();

    // Agréger les sparklines pour le graphique de capitalisation totale
    const aggregatedSparkline = React.useMemo(() => aggregateSparklines(coins), [coins]);

    const marketSparkPoints = aggregatedSparkline ? buildSparklinePoints(aggregatedSparkline, 140, 60) : null;

    const totalMarketCapChangePercent = React.useMemo(() => computeTotalMarketCapChangePercent(coins), [coins]);

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

    // Filtrage des onglets
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

    // Filtrage combiné onglet + recherche + filtres avancés 
    const tabFilteredCoins = getFilteredCoinsByTab(coins, activeTab);
    const advancedFilteredCoins = applyAdvancedFilters(tabFilteredCoins, advancedFilters, userWatchlist);
    const searchFilteredCoins = advancedFilteredCoins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cooldown pour le boutton de Refresh
    const handleRefresh = () => {
        if (refreshCooldown || loading) return;
        fetchCoins();
        setRefreshCooldown(true);
        const start = performance.now();

        const animate = () => {
            const now = performance.now();
            const elapsed = now - start;
            const progress = Math.min(elapsed / cooldownDuration, 1);
            setCooldownProgress(progress);
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setRefreshCooldown(false);
                setCooldownProgress(0);
            }
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    // Nettoyage du requestAnimationFrame
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Pagination - 40 coins par page
    const getCurrentPageCoins = () => {
        const startIndex = (currentPage - 1) * 40;
        const endIndex = startIndex + 40;
        return searchFilteredCoins.slice(startIndex, endIndex);
    };

    const filteredCoins = getCurrentPageCoins();

    // Met à jour le total des pages quand la recherche, l'onglet ou les filtres changent
    useEffect(() => {
        const totalResults = searchFilteredCoins.length;
        setTotalPages(Math.ceil(totalResults / 40));
    }, [searchTerm, activeTab, coins.length, advancedFilters]);

    // Remet à la page 1 quand une recherche est effectuée
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
            {categoryDetails ? (
                <div className="min-h-[60vh] flex flex-col justify-center items-center px-4">
                    <div
                        style={{
                            width: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1.5rem',
                            marginTop: '2rem'
                        }}
                    >
                        {/* Titre principal */}
                        <h1 className="text-4xl max-w-6xl md:text-5xl font-bold leading-tight">
                            {categoryDetails.name}
                        </h1>
                        {/* Sous-titre */}
                        <p className="text-xl md:text-2xl font-light opacity-75">
                            {categoryDetails.content}
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '2rem',
                                marginTop: '1rem',
                            }}
                        >
                            {/* Capitalisation */}
                            <div
                                style={{
                                    backgroundColor: '#232330ff',
                                    color: 'white',
                                    height: '110px',
                                    width: '290px',
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    paddingLeft: '1.5rem',
                                }}
                            >
                                <h1 style={{ fontSize: '1.2rem', color: '#c7c7deff' }}>Market Cap</h1>
                                <div
                                    style={{
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        gap: '1rem',
                                        fontSize: '1.4rem',
                                        alignItems: 'center',
                                    }}
                                >
                                    <h2>{getFormatMarketCap(categoryDetails.market_cap)}</h2>
                                    <h2 style={{ fontSize: '0.9rem' }}>{formatPercentage(categoryDetails.market_cap_change_24h)}</h2>
                                </div>
                            </div>

                            {/* Volume 24h */}
                            <div
                                style={{
                                    backgroundColor: '#232330ff',
                                    color: 'white',
                                    height: '110px',
                                    width: '290px',
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    paddingLeft: '1.5rem',
                                }}
                            >
                                <h1 style={{ fontSize: '1.2rem', color: '#c7c7deff' }}>Volume 24h</h1>
                                <h2
                                    style={{
                                        marginTop: '0.5rem',
                                        fontSize: '1.4rem'
                                    }}
                                >{getFormatMarketCap(categoryDetails.volume_24h)}</h2>
                            </div>
                        </div>

                        {/* Barre de recherche */}
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            placeholder="Explore crypto..."
                        />
                    </div>
                </div>
            ) : (
                (
                    <div className="min-h-[60vh] flex flex-col justify-center items-center px-4">
                        <div className="text-center mx-auto space-y-8">
                            {/* Titre principal */}
                            <h1 className="text-4xl max-w-6xl md:text-5xl font-bold leading-tight">
                                Naviguez dans le monde de la cryptomonnaie en toute simplicité.
                            </h1>
                            {/* Sous-titre */}
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
                )
            )}

            {/* Aperçu top : Top gagnants & Top par volume */}
            <div className="max-w-[85rem] mx-auto px-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Colonne métriques gauche : Capitalisation + Volume 24h */}
                                <div className="flex flex-col gap-4">
                                    <div style={{ backgroundColor: '#141418ff', borderRadius: '16px', padding: '16px', color: '#FFFFFF', height: '120px' }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm text-white/80">Capitalisation</div>
                                                <div className="text-xl font-bold mt-2">{getFormatMarketCap(coins.reduce((s, c) => s + (c.market_cap || 0), 0))}</div>
                                                <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{formatPercentage(totalMarketCapChangePercent)}</div>
                                            </div>
                                            <div style={{ width: 170, height: 60 }}>
                                                {/*chart capitalisation*/}
                                                <svg width="130" height="90" viewBox="0 0 130 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    {marketSparkPoints ? (
                                                        <polyline points={marketSparkPoints} stroke="#3b82f6" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                                    ) : (
                                                        <polyline points="0,40 20,32 40,20 60,24 80,18 100,22 120,28" stroke="#3b82f6" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                                    )}
                                                </svg>
                                            </div>
                                        </div>
                                    </div>



                                    <div style={{ backgroundColor: '#141418ff', borderRadius: '16px', padding: '16px', color: '#FFFFFF', height: '140px' }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm text-white/80">24h Trading Volume</div>
                                                {/* on additionne le volume de tous les coins (total_volume) */}
                                                <div className="text-xl font-bold mt-2">{getFormatMarketCap(coins.reduce((s, c) => s + (c.total_volume || 0), 0))}</div>
                                            </div>
                                            <div style={{ width: 240, height: '100px', display: 'flex', alignItems: 'flex-start' }}>
                                                {/* Mini-barres */}
                                                {topTraded.length === 0 ? (
                                                    <div className="text-sm text-white/60">Pas de données</div>
                                                ) : (
                                                    <div className="space-y-1 w-full" style={{ maxHeight: '150px', overflow: 'hidden' }}>
                                                        {(() => {

                                                            // Trouver le volume max pour le pourcentage
                                                            const maxVol = Math.max(...topTraded.map(c => c.total_volume || 0), 1);
                                                
                                                            return topTraded.map((c) => {
                                                                const vol = c.total_volume || 0;
                                                                //calcul du pourcentage
                                                                const pct = Math.round((vol / maxVol) * 100);
                                                                return (
                                                                    <div key={c.id} className="flex items-center gap-2" style={{ lineHeight: 1 }}>
                                                                        {/*  */}
                                                                        <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full" onError={(e)=>{(e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4='}} />
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="text-sm font-medium uppercase">{c.symbol}</div>
                                                                                <div className="text-xs text-white/80">{getFormatMarketCap(vol)}</div>
                                                                            </div>
                                                                            <div className="w-full h-2 bg-white/10 rounded mt-1 overflow-hidden">
                                                                            {/* la barre de volume  */}
                                                                                <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', transition: 'width 360ms ease' }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                </div>
                    {/* Top Gagnants */}
                    <div style={{ backgroundColor: '#141418ff', borderRadius: '16px', padding: '16px', color: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Top 3 Gagnants (24h)</h3>
                            
                        </div>
                        <div className="space-y-2">
                                {loading ? (
                                // squelettes - placeholders bleus translucides
                                <div className="space-y-2">
                                    {[1,2,3].map(i => (
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
                            ) : (
                                topGainers.length === 0 ? (
                                    <div className="text-sm text-white/60">Pas encore de données</div>
                                ) : (
                                    topGainers.map(coin => (
                                        <div
                                            key={coin.id}
                                            onClick={() => router.push(`/secure/specificCoin/${coin.id}`)}
                                            className="flex items-center justify-between p-2 rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" onError={(e)=>{(e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4='}} />
                                                <div>
                                                    <div className="font-medium">{coin.name}</div>
                                                    <div className="text-sm text-white/60 uppercase">{coin.symbol}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                {formatPercentage(coin.price_change_percentage_24h)}
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>

                    {/* Top par volume */}
                    <div style={{ backgroundColor: '#141418ff', borderRadius: '16px', padding: '16px', color: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Top 3 par Volume (24h)</h3>

                        </div>
                        <div className="space-y-2">
                                        {loading ? (
                                <div className="space-y-2">
                                    {[1,2,3].map(i => (
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
                            ) : (
                                topTraded.length === 0 ? (
                                    <div className="text-sm text-white/60">Pas encore de données</div>
                                ) : (
                                    topTraded.map(coin => (
                                        <div
                                            key={coin.id}
                                            onClick={() => router.push(`/secure/specificCoin/${coin.id}`)}
                                            className="flex items-center justify-between p-2 rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" onError={(e)=>{(e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4='}} />
                                                <div>
                                                    <div className="font-medium">{coin.name}</div>
                                                    <div className="text-sm text-white/60 uppercase">{coin.symbol}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-white/80">
                                                {getFormatMarketCap(coin.total_volume || 0)}
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section des cryptomonnaies */}
            <div className="min-h-screen mt-10">
                <div className="max-w-[85rem] mx-auto">
                    {/* Titre Aperçu */}
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
                                        className={`pb-4 px-1 text-md transition-colors ${activeTab === tabKey
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
                                onClick={handleRefresh}
                                disabled={loading || refreshCooldown}
                                startIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                }
                                sx={{
                                    mt: -1,
                                    mb: 1,
                                    color: refreshCooldown ? 'gray' : undefined,
                                    borderColor: refreshCooldown ? 'gray' : undefined,
                                    background: refreshCooldown
                                        ? `linear-gradient(90deg, #222222ff ${cooldownProgress * 100}%, transparent ${cooldownProgress * 100}%)`
                                        : undefined,
                                    transition: 'background 0.3s',
                                }}
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
                                    <div className="min-h-auto">
                                {filteredCoins.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">Aucun résultat trouvé</div>
                                ) : (
                                    <CoinsTable
                                        coins={filteredCoins}
                                        rankOffset={(currentPage - 1) * 40}
                                        showSparkline={true}
                                                onRowClick={(coinId) => { router.push(`/secure/specificCoin/${coinId}`); }}
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
                                    const pages: React.ReactNode[] = [];
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