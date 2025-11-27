"use client"
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from "@mui/material/Button";
import MarketOverviewGauges from '../components/Dashboard/MarketOverviewGauges';
import TopWinningCoins from '../components/Dashboard/TopWinningCoins';
import TopLoserCoins from '../components/Dashboard/TopLoserCoins';
import DailyNews from '../components/Dashboard/DailyNews';
import WatchlistCarousel from '../components/Dashboard/WatchlistCarousel';
import HomeSection from "../simulator/secure/components/HomeSection";
import { useEffect, useState } from 'react';
import { set } from 'lodash';

export default function DashboardContent() {
  const { data: session } = useSession();
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Check if user has a portfolio ---
  useEffect(() => {
    async function checkPortfolio() {
      try {
        const res = await fetch("/api/simulator/portfolio");
        const data = await res.json();
        // Portfolio existe si data != null
        setHasPortfolio(data && typeof data.cash !== "undefined");
      } catch {
        setHasPortfolio(false);
      }
      setLoading(false);
    }
    checkPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Chargement...
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          borderRadius: '20px',
          padding: '16px',
          backgroundColor: '#141418ff',
          textAlign: 'center',
          flexDirection: 'column',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '32px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '90%',
          height: '500px',
          boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
        }}
      >
        {hasPortfolio ? (
          <HomeSection />
        ) : (
          <>
            <Typography variant="h4"
              sx={{ mb: '30px', fontWeight: 'bold' }}
            >
              Jouez vos pièces. Dominez le marché.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Essayez dès maintenant notre simulateur gratuit de trading crypto.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: '#FFDD00', textDecoration: 'underline' }}>
              Sans portefeuille. Sans risque.
            </Typography>
            <Button
              variant="outlined"
              href="/secure/simulator/accueil"
              sx={{
                mt: 5,
                mb: 1,
                padding: '16px 40px',
                borderRadius: '15px',
                borderColor: '#FFDD00',
                borderWidth: '1.5px',
                color: '#FFDD00',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e6c200',
                  color: 'black',
                  borderColor: '#e6c200',
                  boxShadow: '0 4px 20px rgba(255, 221, 0, 0.3)'
                }
              }}
            >
              Essayez le simulateur
            </Button>
          </>
        )}
      </div>

      <div
        style={{
          width: '90%',
          display: 'flex',
          gap: '24px',
          margin: '24px auto 0',
          flexWrap: 'wrap',
        }}
      >
        {/* CÔTÉ GAUCHE */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: '300px',
          }}
        >
          {/* Market Status */}
          <div
            style={{
              backgroundColor: '#141418ff',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '320px',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Aperçu du marché
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MarketOverviewGauges />
            </Box>
          </div>

          {/* Top winning coins */}
          <div
            style={{
              backgroundColor: '#141418ff',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '400px',
              boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1 }}>
              Top des hausses du jour
            </Typography>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <TopWinningCoins /> {/* Dans components/TopWinningCoins.tsx */}
            </Box>
          </div>
        </div>

        {/* CÔTÉ DROIT */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: '300px',
          }}
        >
          {/* Daily News */}
          <div
            style={{
              backgroundColor: '#141418ff',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '435px',
              boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mt: 2.5, textAlign: 'center' }}>
              Nouvelles de la journée
            </Typography>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <DailyNews /> {/* Dans components/DailyNews.tsx */}
            </Box>
          </div>

          {/* Top losing coins */}
          <div
            style={{
              backgroundColor: '#141418ff',
              borderRadius: '16px',
              padding: '16px',
              color: '#FFFFFF',
              height: '285px',
              boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1.5 }}>
              Top des baisses du jour
            </Typography>
            <Box sx={{ flex: 1, overflow: 'auto', mr: 1.5 }}>
              <TopLoserCoins /> {/* Dans components/TopLoserCoins.tsx */}
            </Box>
          </div>
        </div>
      </div>

      {/* Watchlist Section - Only shown when user is logged in */}
      {session?.user?.email && (
        <div
          style={{
            width: '90%',
            margin: '24px auto',
            backgroundColor: '#141418ff',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
              Liste de suivi
            </Typography>
            <Button
              variant="outlined"
              href="/secure/account/watchlist"
              sx={{
                borderRadius: '12px',
                borderColor: '#3B82F6',
                color: '#3B82F6',
                padding: '8px 20px',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderColor: '#3B82F6',
                }
              }}
            >
              Voir plus
            </Button>
          </div>
          <WatchlistCarousel />
        </div>
      )}
    </>
  );
}