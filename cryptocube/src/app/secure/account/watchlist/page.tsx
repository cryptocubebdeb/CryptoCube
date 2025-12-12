"use client"

import Link from "next/link"
import Sidebar from "../../components/Sidebar";
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { CoinData } from "@/app/lib/definitions"
import { getWatchlistCoins } from "@/app/lib/getWatchlistCoins"
import { fetchWatchlistIds, removeFromWatchlist } from "@/app/lib/watchlistActions"
import CoinsTable from "../../components/CoinsTable"

export default function Page() {
  const { data: session, status } = useSession()
  const userId = (session?.user as { id?: string })?.id
  const { t } = useTranslation()

  const [watchlistCoins, setWatchlistCoins] = useState<CoinData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingCoinId, setRemovingCoinId] = useState<string | null>(null)

  // Fetch watchlist coins
  useEffect(() => {
    const fetchWatchlistCoinsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Récupérer les IDs des coins de la watchlist
        const coinIds = await fetchWatchlistIds()

        if (coinIds.length === 0) {
          setWatchlistCoins([])
          setIsLoading(false)
          return
        }

        // Récupérer les détails des coins depuis CoinGecko
        const coinsData = await getWatchlistCoins(coinIds)
        setWatchlistCoins(coinsData)
      } catch (err) {
        console.error(t("watchlist.error"), err)
        setError(err instanceof Error ? err.message : t("watchlist.errorOccurred"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchWatchlistCoinsData()
  }, [session?.user?.email])


  // While session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>{t("watchlist.loading")}</p>
      </div>
    )
  }

  // If not logged in
  if (!userId || !session?.user?.email) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>{t("watchlist.mustLogin")}</p>
      </div>
    )
  }
  
  // Remove coin from watchlist
  const removeCoin = async (e: React.MouseEvent, coinId: string) => {
    e.stopPropagation()

    setRemovingCoinId(coinId)
    try {
      const success = await removeFromWatchlist(coinId)
      if (success) {
        setWatchlistCoins(prev => prev.filter(coin => coin.id !== coinId))
      } else {
        console.error(t("watchlist.removeError"))
      }
    } catch (error) {
      console.error(t("watchlist.error"), error)
    } finally {
      setRemovingCoinId(null)
    }
  }

  return (
  <div className="flex h-screen p-10">
      {/* userId is now a string */}
      <Sidebar userId={userId} />

      {/* Main Content Area */}
      <main className="main flex-1 mt-1 rounded-2xl overflow-auto" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)' }}>
        <h2 className="title mb-12">{t("watchlist.title")}</h2>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-xl">{t("watchlist.loading")}</div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-6">
            {error}
          </div>
        )}

        {!isLoading && !error && watchlistCoins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl mb-4">{t("watchlist.empty")}</p>
            <Link href="/secure/coins" className="text-blue-400 hover:underline">
              {t("watchlist.browseCryptos")}
            </Link>
          </div>
        )}

        {!isLoading && !error && watchlistCoins.length > 0 && (
          <div className="px-6">
            <CoinsTable
              coins={watchlistCoins}
              rankOffset={0}
              showSparkline={true}
              onRowClick={(coinId: string) => { window.location.href = `/secure/specificCoin/${coinId}` }}
              renderStar={(coinId: string) => (
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => removeCoin(e, coinId)}
                  className={`transition-colors p-1 rounded text-yellow-500 hover:text-yellow-400 ${
                    removingCoinId === coinId ? "opacity-50" : ""
                  }`}
                  aria-label={t("watchlist.removeAriaLabel")}
                  title={t("watchlist.removeFromWatchlist")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    strokeWidth={1.5}
                  >
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
  )
}
