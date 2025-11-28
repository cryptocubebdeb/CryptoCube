"use client"

import { useTranslation } from "react-i18next";
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from "@mui/material/Button";
import MarketOverviewGauges from '../components/Dashboard/MarketOverviewGauges';
import TopWinningCoins from '../components/Dashboard/TopWinningCoins';
import TopLoserCoins from '../components/Dashboard/TopLoserCoins';
import DailyNews from '../components/Dashboard/DailyNews';
import WatchlistCarousel from '../components/Dashboard/WatchlistCarousel';

export default function DashboardContent() {
  const { t } = useTranslation();
  const { data: session } = useSession();

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
          <Typography variant="h4" sx={{ mb: '30px', fontWeight: 'bold' }}>
          {t("dashboard.playAndDominate")}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("dashboard.trySimulator")}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2, color: '#FFDD00', textDecoration: 'underline' }}>
          {t("dashboard.noRisk")}
        </Typography>

          <Button
                variant="outlined"
                href="/secure/simulator"
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
                 {t("dashboard.trySimulatorButton")}
            </Button>
      </div>

      <div
        style={{
          width: '90%',
          display: 'flex',
          gap: '24px',
          margin: '24px auto 0',
          flexWrap: 'wrap'
        }}
      >
        {/* CÔTÉ GAUCHE */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: '300px'
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
                {t("dashboard.marketOverview")}
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
<<<<<<< HEAD
      <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1 }}>
         {t("dashboard.topGainers")}
      </Typography>
=======
            <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1 }}>
              Top des hausses du jour
            </Typography>
>>>>>>> main
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
            minWidth: '300px'
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
                {t("dashboard.dailyNews")}
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
<<<<<<< HEAD
      <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1.5 }}>
        {t("dashboard.topLosers")}
      </Typography>
=======
            <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1.5 }}>
              Top des baisses du jour
            </Typography>
>>>>>>> main
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
            boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
          }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
              {t("dashboard.watchlist")}
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
              {t("dashboard.viewMore")}
            </Button>
          </div>

          <WatchlistCarousel />
        </div>
      )}
    </>
  );
}