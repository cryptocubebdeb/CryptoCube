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
import HomeSection from "../simulator/secure/components/HomeSection";
import PortfolioChart from "../components/Portfolio/PortfolioChart";
import { useEffect, useState } from 'react';
import { getFormatPrix } from '../../lib/getFormatData';

export default function DashboardContent() {
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);

  // Store user's current cash balance
  const [cash, setCash] = useState(0);

  // Store user's coin holdings
  const [holdings, setHoldings] = useState<any[]>([]);

  // Store pending orders (submitted but not executed)
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  // Store executed orders (already completed trades)
  const [executedOrders, setExecutedOrders] = useState<any[]>([]);

  // Load portfolio, pending orders, and executed orders on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all three API endpoints in parallel for efficiency
        const [portfolioRes, pendingRes, executedRes] = await Promise.all([
          fetch("/api/simulator/portfolio"),
          fetch("/api/simulator/orders/list/pending"),
          fetch("/api/simulator/orders/list/executed"),
        ]);

        // Parse JSON responses
        const portfolioData = await portfolioRes.json();
        const pendingData = await pendingRes.json();
        const executedData = await executedRes.json();

        // Set state values safely
        setCash(Number(portfolioData.cash || 0));
        setHoldings(Array.isArray(portfolioData.holdings) ? portfolioData.holdings : []);

        setPendingOrders(Array.isArray(pendingData.orders) ? pendingData.orders : []);
        setExecutedOrders(Array.isArray(executedData.orders) ? executedData.orders : []);
      } catch (err) {
        // If API fails, reset all state to defaults and log the error
        console.error("Failed to load home data:", err);
        setCash(0);
        setHoldings([]);
        setPendingOrders([]);
        setExecutedOrders([]);
      }

      // Mark loading as complete
      setLoading(false);
    }

    loadData();
  }, []);


  // Verification de portfolio utilisateur
=======
  const { t } = useTranslation();
>>>>>>> main
  const { data: session } = useSession();
  const [hasPortfolio, setHasPortfolio] = useState(false);

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
<<<<<<< HEAD
        style={{
          borderRadius: '20px',
          padding: '16px',
          backgroundColor: '#141418ff',
          textAlign: 'center',
          flexDirection: 'column',
          display: 'flex',
          justifyContent: hasPortfolio ? 'flex-start' : 'center',
          alignItems: 'center',
          marginTop: '32px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '90%',
          height: hasPortfolio ? '650px' : '500px',
          boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
        }}

        // Lorsque l'utilisateur a un portfolio, il peut hover et cliquer vers simulateur
        className={ hasPortfolio ? "cursor-pointer transition duration-300 hover:scale-102 hover:shadow-lg hover:bg-yellow-400" : ""}
        onClick={ hasPortfolio ? () => window.location.href = '/secure/simulator/secure' : undefined }
      >
        {hasPortfolio ? (
          <>
            <div className="flex flex-col gap-2 mt-7 mb-5">
              <h2 className="text-3xl font-bold mb-5 text-yellow-400">Portfolio Overview</h2>
              {loading ? (
                <p className="text-slate-400 text-sm">Loading data…</p>
              ) : (
                <div className="grid grid-cols-3 gap-50 mb-5 text-sm">
                  <div>
                    <p className="text-xl text-slate-400 mb-2">Cash</p>
                    <p className="text-xl text-white font-semibold">{getFormatPrix(cash)}</p>
                  </div>
                  <div>
                    <p className="text-xl text-slate-400 mb-2">Holdings</p>
                    <p className="text-xl text-white font-semibold">{holdings.length}</p>
                  </div>
                  <div>
                    <p className="text-xl text-slate-400 mb-2">Pending Orders</p>
                    <p className="text-xl text-white font-semibold">{pendingOrders.length}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PortfolioChart width={1400} height={380} />
            </div>
          </>
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
=======
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
>>>>>>> main
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
<<<<<<< HEAD
              Aperçu du marché
=======
                {t("dashboard.marketOverview")}
>>>>>>> main
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
              Top gagnants du jour
            </Typography>
=======
<<<<<<< HEAD
      <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1 }}>
         {t("dashboard.topGainers")}
      </Typography>
=======
            <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1 }}>
              Top des hausses du jour
            </Typography>
>>>>>>> main
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
<<<<<<< HEAD
              Nouvelles de la journée
=======
                {t("dashboard.dailyNews")}
>>>>>>> main
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
              Top perdants du jour
            </Typography>
=======
<<<<<<< HEAD
      <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1.5 }}>
        {t("dashboard.topLosers")}
      </Typography>
=======
            <Typography variant="h5" gutterBottom sx={{ ml: 2, mt: 1.5 }}>
              Top des baisses du jour
            </Typography>
>>>>>>> main
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
<<<<<<< HEAD
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
=======
            boxShadow: '8px 8px 7px rgba(0, 0, 0, 0.2)'
          }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
>>>>>>> main
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