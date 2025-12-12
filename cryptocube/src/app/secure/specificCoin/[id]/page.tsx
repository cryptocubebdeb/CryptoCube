import Image from "next/image";
import { getCoin } from '../../../lib/getCoin';
import { Geologica } from "next/font/google"
import { getCoinChart } from "../../../lib/getCoinChart";
import CoinChart from "../../components/SpecificCoin/CoinChart";
import RiskGauge from "../../../../app/secure/components/GaugeComponent/RiskGauge";
import CoinDailyNews from "../../../../app/secure/components/CoinDailyNews";
import { getCoinNews } from "../../../lib/getCoinNews";
import CoinMarkets from "../../components/SpecificCoin/CoinMarkets";
import CoinTreasuries from "../../components/SpecificCoin/CoinTreasuries";
import WatchlistButton from "../../components/SpecificCoin/WatchlistBtn";
import BuySection from "../../components/SpecificCoin/BuySection";
import LiveBinanceTrades from "../../components/SpecificCoin/LiveBinanceTrades";
import { T } from "../../components/Translate";


const geologica = Geologica({ subsets: ["latin"], weight: ["400", "700"] });

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    console.log("[SpecificCoinPage] id =", id);

    // --- Fetch data ---
    const [coinData, series] = await Promise.all([
        getCoin(id),
        getCoinChart(id, 30, "usd"),
    ]);

    let news: Awaited<ReturnType<typeof getCoinNews>> = [];
    try {
        news = await getCoinNews(id);
    } catch {
        news = [];
    }

    // --- Basic coin info ---
    const name = coinData?.name ?? id; // Name of the current crypto
    const logo = coinData?.image?.large as string | undefined; // Image of the crypto logo
    const symbol = coinData?.symbol; // Acronym of the crypto (ex: Bitcoin → BTC)
    const rank = coinData?.market_cap_rank; // Global market rank of the crypto
    const coinDescription = coinData?.description?.en ?? "";
    const websiteUrl = coinData?.links?.homepage?.[0] || null;

    // --- Market data ---
    const currentPrice = coinData?.market_data?.current_price?.usd; // Current price in USD
    const priceChangePercentage = coinData?.market_data?.price_change_percentage_24h; // Value change in the past 24h in %
    const marketCap = coinData?.market_data?.market_cap?.usd; // Market capitalization in USD
    const totalVolume = coinData?.market_data?.total_volume?.usd; // 24h trading volume in USD
    const fdv = coinData?.market_data?.fully_diluted_valuation?.usd; // Fully Diluted Valuation (if all coins were in circulation)
    // --- Price stats ---
    const high24h = coinData?.market_data?.high_24h?.usd; // Highest price in the last 24h
    const low24h = coinData?.market_data?.low_24h?.usd; // Lowest price in the last 24h
    const ath = coinData?.market_data?.ath?.usd; // All-time high price
    const atl = coinData?.market_data?.atl?.usd; // All-time low price
    const athChangePercentage = coinData?.market_data?.ath_change_percentage?.usd; // % difference from ATH
    const atlChangePercentage = coinData?.market_data?.atl_change_percentage?.usd; // % difference from ATL
    const athDate = coinData?.market_data?.ath_date?.usd; // date string of the all-time high
    const atlDate = coinData?.market_data?.atl_date?.usd; // date string of the all-time low

    const formattedAthDate = new Date(athDate).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", });
    const formattedAtlDate = new Date(atlDate).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", });

    const high24hDiff = ((currentPrice - low24h) / (high24h - low24h)) * 100; // position in the 24h range
    const fromHigh24h = ((currentPrice - high24h) / high24h) * 100; // how far from 24h high
    const fromLow24h = ((currentPrice - low24h) / low24h) * 100; // how far from 24h low
    const PercentageChangeIn7d = coinData?.market_data?.price_change_percentage_7d ?? null; // % change in the past 7 days
    const price7dAgo = currentPrice / (1 + PercentageChangeIn7d / 100); // Price 7 days ago, based on the % change
    const priceDifferenceIn7d = currentPrice - price7dAgo; // Price diff

    // --- Check if this coin is tradable on Binance ---
    const binanceSymbol = symbol.toUpperCase() + "USDT";

    let isTradable = false;
    try {
        const binanceCheck = await fetch(
            `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${binanceSymbol}`,
            { cache: "no-store" }
        );
        isTradable = binanceCheck.ok;
    } catch {
        isTradable = false;
    }


    /*
        This is a temporary risk score, it is only based on the percentage change of the past week. 
        For now, we assume that a ±15% change corresponds to maximum volatility (100% risk).
        So currently its only a volatility index, the logic needs to be improved to take more data into consideration (volume, market cap, etc.)
    */
    const riskScore = Math.min(100, (Math.abs(PercentageChangeIn7d) / 15) * 100); // Volatility-based risk score (0–100)

    const globalRes = await fetch("https://api.coingecko.com/api/v3/global", { cache: "no-store" });
    const { data: g } = (await globalRes.json()) ?? {};
    const marketCapChange = Number.isFinite(Number(g?.market_cap_change_percentage_24h_usd))
        ? Number(g.market_cap_change_percentage_24h_usd)
        : 0;
    const marketHealth = Math.min(100, Math.max(0, 50 + marketCapChange));

    const res = await fetch("https://api.alternative.me/fng/"); // Fetch global sentiment index (updated daily)
    const { data } = await res.json();
    const fearGreedValue = parseInt(data[0].value); // (0 = extreme fear, 100 = extreme greed)
    const fearGreedLabel = data[0].value_classification; //  // Text label: Extreme_Fear:0–24  Fear:25–44  Neutral:45–54  Greed:55–74  Extreme_Greed:75–100

    // --- Supply metrics ---
    const circulatingSupply = coinData?.market_data?.circulating_supply; // Number of coins currently in circulation
    const totalSupply = coinData?.market_data?.total_supply; // Total number of coins issued
    const maxSupply = coinData?.market_data?.max_supply; // Maximum possible number of coins

    return (
        <div className={`min-h-screen w-full flex flex-col ${geologica.className}`}>
            <div className="flex flex-1 justify-center w-full pt-4">               
                {/* Main container */}
                <div className="w-full max-w-[1600px] px-4 xl:px-8 flex items-start gap-12 mt-10">
                    {/* Right column - details */}
                    <div className="flex-[0.27] pr-10 text-xl rounded-[2px] shadow-md border-r border-white/20" style={{ color: 'var(--foreground)' }}>

                        {/* Crypto Name and Logo */}
                        <div className="flex items-center gap-4 p-4 pt-0" style={{ color: 'var(--foreground)' }}>
                            {logo && (
                                <Image
                                    src={logo}
                                    alt={`${name} logo`}
                                    width={40}
                                    height={40}
                                    className="rounded"
                                    priority
                                />
                            )}
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-3xl">{name}</h1>
                                <span className="text-lg uppercase" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{symbol}</span>
                            </div>
                        </div>

                        {/* Current price */}
                        <div className="p-4 border-b border-white/10">
                            <span className="text-3xl" style={{ color: 'var(--foreground)' }}>
                                ${currentPrice?.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                            </span>
                            <span
                                className="text-2xl font-medium ml-3"
                                style={{ color: priceChangePercentage >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}
                            >
                                {priceChangePercentage >= 0 ? "+" : ""}
                                {priceChangePercentage?.toFixed(2)}% (24h)
                            </span>
                        </div>

                        {/*------------- Buy Section -------------*/}
                        <div className="ml-8">
                            <BuySection
                                coinId={id}
                                symbol={coinData?.symbol.toUpperCase()}
                                price={currentPrice}
                                logo={logo}
                            />
                        </div>
                       

                        {/*------------- Market Stats -------------*/}
                        <div className="mt-6 ml-4">
                            <h2 className="text-xl mb-3" style={{ color: 'var(--foreground)', opacity: 0.9 }}><T k="specificCoin.marketStats" /></h2>
                            <div className="divide-y divide-white/10">
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.marketCap" /></span>
                                    <span className="font-small" style={{ color: 'var(--foreground)' }}>${marketCap?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.fdv" /></span>
                                    <span className="font-small" style={{ color: 'var(--foreground)' }}>${fdv?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.volume24h" /></span>
                                    <span className="font-small" style={{ color: 'var(--foreground)' }}>${totalVolume?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.rank" /></span>
                                    <span className="font-small" style={{ color: 'var(--foreground)' }}>#{rank}</span>
                                </div>
                            </div>
                        </div>

                        {/*------------- Price Performance -------------*/}
                        <div className="mt-8 ml-4">
                            <h2 className="text-xl mb-3" style={{ color: 'var(--foreground)', opacity: 0.9 }}><T k="specificCoin.pricePerformance" /></h2>
                            <div className="divide-y divide-white/10">

                                {/* 24h Range */}
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.range24h" /></span>
                                    <span className="font-small text-right" style={{ color: 'var(--foreground)' }}>
                                        ${low24h?.toLocaleString("en-CA")} - ${high24h?.toLocaleString("en-CA")}
                                        <div className="text-base" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                                            <T k="specificCoin.fromLow" />: <span style={{ color: fromLow24h >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                                                {fromLow24h?.toFixed(2)}%
                                            </span> · <T k="specificCoin.fromHigh" />:
                                            <span className="ml-1" style={{ color: fromHigh24h >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                                                {fromHigh24h?.toFixed(2)}%
                                            </span>
                                        </div>
                                    </span>
                                </div>

                                {/* 7-Day Range */}
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.variation7d" /></span>
                                    <span
                                        className="font-small text-right"
                                        style={{ color: priceDifferenceIn7d >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}
                                    >
                                        {PercentageChangeIn7d >= 0 ? "+" : ""}
                                        {PercentageChangeIn7d.toFixed(2)}%
                                        <span className="ml-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                                            ({priceDifferenceIn7d >= 0 ? "+" : "-"}{Math.abs(priceDifferenceIn7d).toLocaleString("en-CA", {
                                                style: "currency",
                                                currency: "usd",
                                                maximumFractionDigits: 0,
                                            })})
                                        </span>
                                    </span>
                                </div>

                                {/* All-Time High */}
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.ath" /></span>
                                    <span className="font-small text-right" style={{ color: 'var(--foreground)' }}>
                                        ${ath?.toLocaleString("en-CA")}
                                        <span className="ml-2" style={{ color: athChangePercentage < 0 ? 'var(--color-red)' : 'var(--color-green)' }}>
                                            {athChangePercentage?.toFixed(2)}%
                                        </span>
                                        <div className="text-base" style={{ color: 'var(--foreground)', opacity: 0.5 }}>{formattedAthDate}</div>
                                    </span>
                                </div>

                                {/* All-Time Low */}
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '1.1rem' }}><T k="specificCoin.atl" /></span>
                                    <span className="font-small text-right" style={{ color: 'var(--foreground)' }}>
                                        ${atl?.toLocaleString("en-CA")}
                                        <span className="ml-2" style={{ color: atlChangePercentage < 0 ? 'var(--color-red)' : 'var(--color-green)' }}>
                                            {atlChangePercentage?.toFixed(2)}%
                                        </span>
                                        <div className="text-base" style={{ color: 'var(--foreground)', opacity: 0.5 }}>{formattedAtlDate}</div>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ------------- Supply Metrics ------------- */}
                        <div className="mt-8 ml-4">
                            <h2 className="text-2xl mb-3" style={{ color: 'var(--foreground)', opacity: 0., fontSize: '1.1rem' }}><T k="specificCoin.supplyMetrics" /></h2>
                            <div className="divide-y divide-white/10">
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7 }}><T k="specificCoin.circulatingSupply" /></span>
                                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{circulatingSupply?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7 }}><T k="specificCoin.totalSupply" /></span>
                                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{totalSupply?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span style={{ color: 'var(--foreground)', opacity: 0.7 }}><T k="specificCoin.maxSupply" /></span>
                                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{maxSupply?.toLocaleString("en-CA")}</span>
                                </div>
                            </div>
                        </div>

                        {/*------------- Gauges Section -------------*/}
                        <div className="mt-10 border border-white/10 rounded-md p-6">
                            <h2 className="text-2xl mb-6 text-center" style={{ color: 'var(--foreground)', opacity: 0.9 }}><T k="specificCoin.marketOverview" /></h2>

                            {/* Volatility Index */}
                            <div className="flex flex-col items-center mb-8">
                                <h3 className="text-lg mb-3" style={{ color: 'var(--foreground)', opacity: 0.8 }}><T k="specificCoin.volatilityIndex" /> — {name}</h3>
                                <RiskGauge value={Math.round(riskScore)} />
                                <p className="text-sm mt-3" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                                    <T k="specificCoin.basedOn7d" /> {Math.round(PercentageChangeIn7d)}%
                                </p>
                            </div>

                            {/* Fear & Greed + Global Market */}
                            <div className="flex justify-center gap-10 flex-wrap">
                                {/* Fear & Greed */}
                                <div className="flex flex-col items-center w-64">
                                    <h3 className="text-lg mb-3" style={{ color: 'var(--foreground)', opacity: 0.8 }}><T k="specificCoin.sentiment" /></h3>
                                    <RiskGauge value={Math.round(fearGreedValue)} />
                                    <p className="text-sm mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{fearGreedLabel}</p>
                                </div>

                                {/* Global Market */}
                                <div className="flex flex-col items-center w-64">
                                    <h3 className="text-lg mb-3" style={{ color: 'var(--foreground)', opacity: 0.8 }}><T k="specificCoin.globalMarket" /></h3>
                                    <RiskGauge value={Math.round(marketHealth)} />
                                    <p className="text-sm mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                                        {marketHealth >= 55 ? <T k="specificCoin.growing" /> : marketHealth <= 45 ? <T k="specificCoin.declining" /> : <T k="specificCoin.stable" />}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left column - chart + risk analysis */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* Chart container */}
                        <div className="rounded-[4px] shadow-md relative" style={{ color: 'var(--foreground)' }}>
                            <div className="w-full min-h-[450px] py-4">
                                <CoinChart coinId={id} currency="usd" />
                            </div>
                        </div>

                        {/* Extra coin fundamentals */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mt-6 text-sm border-t border-white/10 pt-4" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                            <div>
                                <span className="block" style={{ color: 'var(--foreground)', opacity: 0.5 }}><T k="specificCoin.launchDate" /></span>
                                <span>{coinData?.genesis_date || <T k="specificCoin.unknown" />}</span>
                            </div>
                            <div>
                                <span className="block" style={{ color: 'var(--foreground)', opacity: 0.5 }}><T k="specificCoin.hashAlgorithm" /></span>
                                <span>{coinData?.hashing_algorithm || <T k="specificCoin.unknown" />}</span>
                            </div>
                            <div>
                                <span className="block" style={{ color: 'var(--foreground)', opacity: 0.5 }}><T k="specificCoin.category" /></span>
                                <span>{coinData?.categories?.[0] || <T k="specificCoin.unknown" />}</span>
                            </div>
                        </div>

                        {/* Live Binance Trades */}
                        <LiveBinanceTrades symbol={symbol.toUpperCase()} />

                        {/* ------------- Description ------------- */}
                        <div className="mt-8">
                            <div className="flex items-baseline justify-between mb-3">
                                <h2 className="text-2xl" style={{ color: 'var(--foreground)', opacity: 0.9 }}><T k="specificCoin.description" /></h2>

                                {/* ------------- Website ------------- */}
                                <div className="flex flex-wrap gap-3 mt-6 text-sm">
                                    <style>{`
                                      .coin-link:hover {
                                        background: var(--coinmarket-hover) !important;
                                      }
                                    `}</style>
                                    {coinData?.links?.subreddit_url && (
                                        <a href={coinData.links.subreddit_url} target="_blank" className="coin-link" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)', borderRadius: '0.375rem', padding: '0.75rem 0.75rem', transition: 'background 0.2s' }}>
                                            Reddit
                                        </a>
                                    )}
                                    {coinData?.links?.repos_url?.github?.[0] && (
                                        <a href={coinData.links.repos_url.github[0]} target="_blank" className="coin-link" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)', borderRadius: '0.375rem', padding: '0.75rem 0.75rem', transition: 'background 0.2s' }}>
                                            GitHub
                                        </a>
                                    )}
                                    {coinData?.links?.homepage?.[0] && (
                                        <a href={coinData.links.homepage[0]} target="_blank" className="coin-link" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)', borderRadius: '0.375rem', padding: '0.75rem 0.75rem', transition: 'background 0.2s' }}>
                                            Website
                                        </a>
                                    )}
                                </div>
                            </div>

                            <details className="group border border-white/10 rounded-md" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)' }}>
                                <details className="group border border-white/10 rounded-md" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)' }}>
                                    <summary className="cursor-pointer list-none px-4 py-3 text-sm sm:text-base select-none" style={{ color: 'var(--foreground)', opacity: 0.75 }}>
                                        <span className="mr-2 font-medium"><T k="specificCoin.about" /> {name}</span>
                                        <span className="group-open:hidden" style={{ color: 'var(--foreground)', opacity: 0.5 }}>· <T k="specificCoin.seeMore" /></span>
                                        <span className="hidden group-open:inline" style={{ color: 'var(--foreground)', opacity: 0.5 }}>· <T k="specificCoin.seeLess" /></span>
                                    </summary>

                                    <div className="px-4 pb-5">
                                        <div
                                            className="text-[13px] sm:text-[14px] leading-relaxed sm:leading-7"
                                            style={{
                                                color: 'var(--foreground)',
                                                opacity: 0.8,
                                                textAlign: "justify",
                                                textJustify: "inter-word",
                                                lineHeight: "1.6",
                                            }}
                                            dangerouslySetInnerHTML={{ __html: coinDescription }}
                                        />
                                        <p className="text-sm italic mt-6" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                                            <T k="specificCoin.updated" /> {new Date(coinData.last_updated).toLocaleString()} · <T k="specificCoin.source" />: CoinGecko
                                        </p>
                                    </div>
                                </details>
                            </details>
                        </div>


                        {/* ------------- Global Prices ------------- */}
                        <div className="mt-2 rounded-md p-3">
                            <h2 className="text-2xl mb-5" style={{ color: 'var(--foreground)', opacity: 0.9 }}><T k="specificCoin.globalPrices" /></h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 text-sm" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                                {[
                                    { code: "usd", label: "USD (Dollar américain)" },
                                    { code: "cad", label: "CAD (Dollar canadien)" },
                                    { code: "eur", label: "EUR (Euro)" },
                                    { code: "gbp", label: "GBP (Livre sterling)" },
                                    { code: "jpy", label: "JPY (Yen japonais)" },
                                    { code: "aud", label: "AUD (Dollar australien)" },
                                    { code: "chf", label: "CHF (Franc suisse)" },
                                    { code: "inr", label: "INR (Roupie indienne)" },
                                ].map(({ code, label }) => {
                                    const value = coinData?.market_data?.current_price?.[code];
                                    return (
                                        <div key={code} className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span style={{ color: 'var(--foreground)', opacity: 0.6 }}>{label}</span>
                                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                {value
                                                    ? value.toLocaleString("en-CA", {
                                                        style: "currency",
                                                        currency: code.toUpperCase(),
                                                        maximumFractionDigits: 0,
                                                    })
                                                    : "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-xs mt-5 text-center" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                                <T k="specificCoin.pricesUpdatedFrom" />
                            </p>
                        </div>

                        {/* ------------- News section ------------- */}
                        <div className="mx-auto" style={{ color: 'var(--foreground)' }}>
                            <CoinDailyNews coinId={id} />
                        </div>
                    </div>
                </div>
            </div>

            {/*------------- Markets Section -------------*/}
            <div className="mt-6 w-[95%] mx-auto mb-12">
                <CoinMarkets coinId={id} />
            </div>

            {/*------------- Treasuries Section -------------*/}
            <div className="mt-6 w-[95%] mx-auto mb-12">
                <CoinTreasuries coinId={id} />
            </div>
        </div>
    );
}

/*
Notes 

data.market_data.current_price.cad
data.market_data.market_cap.cad
data.market_data.total_volume.cad
data.market_data.high_24h.cad
data.market_data.low_24h.cad
data.market_data.price_change_percentage_24h
data.market_data.circulating_supply
data.market_data.total_supply
data.market_data.max_supply
data.market_data.ath.cad
data.market_data.atl.cad
*/