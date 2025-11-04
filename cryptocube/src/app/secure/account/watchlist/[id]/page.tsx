"use client"

import Link from "next/link"
import Sidebar from "../../../components/Sidebar"
import styles from '../../page.module.css'
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { CoinData } from '@/app/lib/definitions';
import { getWatchlistCoins } from '@/app/lib/getWatchlistCoins';
import { fetchWatchlistIds, removeFromWatchlist } from '@/app/lib/watchlistActions';
import CoinsTable from '../../../components/CoinsTable';


export default function Page() {
    const { data: session } = useSession();
    const [watchlistCoins, setWatchlistCoins] = useState<CoinData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingCoinId, setRemovingCoinId] = useState<string | null>(null);

    const USER_ID = session?.user?.id ? Number(session.user.id) : null;

    // Fetch watchlist coins
    useEffect(() => {
        if (!session?.user?.email) return;

        const fetchWatchlistCoins = async () => {
            try {
                setIsLoading(true);
                setError(null);

                //Récupérer les IDs des coins de la watchlist
                const coinIds = await fetchWatchlistIds();

                if (coinIds.length === 0) {
                    setWatchlistCoins([]);
                    setIsLoading(false);
                    return;
                }

                //Récupérer les détails des coins depuis CoinGecko
                const coinsData = await getWatchlistCoins(coinIds);
                setWatchlistCoins(coinsData);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlistCoins();
    }, [session?.user?.email]);

    // Remove coin from watchlist
    const removeCoin = async (e: React.MouseEvent, coinId: string) => {
        e.stopPropagation();
        if (!session?.user?.email) return;

        setRemovingCoinId(coinId);
        try {
            const success = await removeFromWatchlist(coinId);
            if (success) {
                setWatchlistCoins(prev => prev.filter(coin => coin.id !== coinId));
            } else {
                console.error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setRemovingCoinId(null);
        }
    };

    if (!USER_ID) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                <p>Veuillez vous connecter pour accéder à votre watchlist</p>
            </div>
        );
    }

    return (
        <><div className="flex h-screen p-10">
            <Sidebar userId={USER_ID} />

            {/* Main Content Area */}
            <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
                <h2 className={`${styles.title} mb-12`}>Ma Watchlist</h2>

                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-xl">Chargement...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-6">
                        {error}
                    </div>
                )}

                {!isLoading && !error && watchlistCoins.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl mb-4">Votre watchlist est vide</p>
                        <Link href="/secure/coins" className="text-blue-400 hover:underline">
                            Parcourir les cryptomonnaies →
                        </Link>
                    </div>
                )}

                {!isLoading && !error && watchlistCoins.length > 0 && (
                    <div className="px-6">
                        <CoinsTable
                            coins={watchlistCoins}
                            rankOffset={0}
                            showSparkline={true}
                            renderStar={(coinId: string) => (
                                <button
                                    onClick={(e) => removeCoin(e as any, coinId)}
                                    className={`transition-colors p-1 rounded text-yellow-500 hover:text-yellow-400 ${removingCoinId === coinId ? 'opacity-50' : ''}`}
                                    aria-label="Remove from watchlist"
                                    title="Retirer de la watchlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" strokeWidth={1.5}>
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            stroke="currentColor"
                                            fill="currentColor"
                                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                        />
                                    </svg>
                                </button>
                            )}
                        />
                    </div>
                )}

            </main>
        </div>
        </>
    );
}