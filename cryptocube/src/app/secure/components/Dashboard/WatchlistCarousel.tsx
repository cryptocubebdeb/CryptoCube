"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { CoinData } from '@/app/lib/definitions';
import { fetchWatchlistIds } from '@/app/lib/watchlistActions';
import { getWatchlistCoins } from '@/app/lib/getWatchlistCoins';
import MiniChart from './MiniChart';

export default function WatchlistCarousel() {
  const { data: session } = useSession();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Nombre de cartes visibles à la fois
  const cardsPerView = 3;

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const loadWatchlist = async () => {
      try {
        setLoading(true);
        const coinIds = await fetchWatchlistIds();
        
        if (coinIds.length === 0) {
          setCoins([]);
          setLoading(false);
          return;
        }

        const coinsData = await getWatchlistCoins(coinIds);
        setCoins(coinsData);
      } catch (err) {
        console.error('Error loading watchlist:', err);
        setError('Erreur lors du chargement de la watchlist');
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, [session?.user?.email]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(coins.length - cardsPerView, prev + 1));
  };

  const handleCoinClick = (coinId: string) => {
    window.location.href = `/secure/specificCoin/${coinId}`;
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <Typography>Chargement de votre watchlist...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: '#EF4444' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (coins.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
        <Typography variant="h6" gutterBottom>
          Votre watchlist est vide
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Ajoutez des cryptomonnaies à votre watchlist depuis la page{' '}
          <a href="/secure/coins" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
            Coins
          </a>
        </Typography>
      </Box>
    );
  }

  const visibleCoins = coins.slice(currentIndex, currentIndex + cardsPerView);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < coins.length - cardsPerView;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Navigation Buttons */}
      {coins.length > cardsPerView && (
        <>
          <IconButton
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            sx={{
              position: 'absolute',
              left: -70,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: canGoPrevious ? '#1F2937' : 'transparent',
              color: canGoPrevious ? '#FFFFFF' : '#4B5563',
              '&:hover': {
                backgroundColor: canGoPrevious ? '#374151' : 'transparent',
              },
              '&:disabled': {
                color: '#4B5563',
              }
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 32 }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            disabled={!canGoNext}
            sx={{
              position: 'absolute',
              right: -70,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: canGoNext ? '#1F2937' : 'transparent',
              color: canGoNext ? '#FFFFFF' : '#4B5563',
              '&:hover': {
                backgroundColor: canGoNext ? '#374151' : 'transparent',
              },
              '&:disabled': {
                color: '#4B5563',
              }
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </>
      )}

      {/* Cards Container */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`,
          gap: '24px',
          transition: 'all 0.3s ease',
        }}
      >
        {visibleCoins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          const priceFormatted = coin.current_price >= 1
            ? `$${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${coin.current_price.toFixed(6)}`;

          return (
            <Box
              key={coin.id}
              onClick={() => handleCoinClick(coin.id)}
              sx={{
                backgroundColor: '#1F2937',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#374151',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              {/* Header: Icon + Name + Symbol */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img
                  src={coin.image}
                  alt={coin.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    marginRight: 12
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {coin.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem'
                    }}
                  >
                    {coin.symbol}
                  </Typography>
                </Box>
              </Box>

              {/* Mini Chart */}
              {coin.sparkline_in_7d?.price && (
                <Box sx={{ mb: 2, height: 80 }}>
                  <MiniChart
                    data={coin.sparkline_in_7d.price}
                    isPositive={isPositive}
                  />
                </Box>
              )}

              {/* Price and Percentage */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: '1.35rem'
                  }}
                >
                  {priceFormatted}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isPositive ? (
                    <TrendingUpIcon sx={{ color: '#10B981', fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      color: isPositive ? '#10B981' : '#EF4444',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    {isPositive ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Indicators */}
      {coins.length > cardsPerView && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 3
          }}
        >
          {Array.from({ length: Math.ceil(coins.length / cardsPerView) }).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: Math.floor(currentIndex / cardsPerView) === idx ? '#3B82F6' : '#4B5563',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentIndex(idx * cardsPerView)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
