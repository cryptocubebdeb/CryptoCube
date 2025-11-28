"use client";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { fetchWatchlistIds, addToWatchlist, removeFromWatchlist } from "../../../lib/watchlistActions";

type WatchlistButtonProps = {
  coinId: string;
};

export default function WatchlistButton({ coinId }: WatchlistButtonProps) {
  const { t } = useTranslation();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Load user's watchlist when component mounts ---
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const ids = await fetchWatchlistIds();
        setIsInWatchlist(ids.includes(coinId));
      } catch (error) {
        console.error("Error loading watchlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, [coinId]);

  // --- Handle add/remove ---
  const handleToggle = async () => {
    setIsLoading(true);

    const success = isInWatchlist
      ? await removeFromWatchlist(coinId)
      : await addToWatchlist(coinId);
      await new Promise(r => setTimeout(r, 300)); // short pause before re-fetching state, without it fetch fails

    if (success) {
      setIsInWatchlist(!isInWatchlist);
    }

    setIsLoading(false);
  };

  if (isLoading)
    return (
      <button
        disabled
        className="px-4 py-2 border border-white/20 rounded-md text-white/60 cursor-not-allowed"
      >
        {t('coinsPage.loading')}
      </button>
    );

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-md border transition ${
        isInWatchlist
          ? "border-red-400 text-red-400 hover:bg-red-400/10"
          : "border-white/30 text-white hover:bg-white/10"
      }`}
    >
      {isInWatchlist ? t('coinsPage.removeFromWatchlist') : t('coinsPage.addToWatchlist')}
    </button>
  );
}
