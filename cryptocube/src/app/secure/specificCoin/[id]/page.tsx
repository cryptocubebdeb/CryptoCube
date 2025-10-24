import Image from "next/image";
import { getCoin } from '../../../lib/getCoin';
import { Geologica } from "next/font/google"
import { getCoinChart } from "../../../lib/getCoinChart";
import CoinChart from "../../components/SpecificCoin/CoinChart";
import RiskGauge from "../../../../app/secure/components/GaugeComponent/RiskGauge";
import CoinDailyNews from "../../../../app/secure/components/CoinDailyNews";
import { getCoinNews } from "../../../lib/getCoinNews";

const geologica = Geologica({ subsets: ["latin"], weight: ["400", "700"] });

export default async function Page({ params }: { params: { id: string } }) {

    const { id } = params; // id example "bitcoin"

    const [coinData, series] = await Promise.all([
        getCoin(id),
        getCoinChart(id, 30, "cad"),
    ]);


    // --- Basic coin info ---
    const name = coinData?.name ?? id; // Name of the current crypto
    const logo = coinData?.image?.large as string | undefined; // Image of the crypto logo
    const symbole = coinData?.symbol ?? id; // Acronym of the crypto (ex: Bitcoin → BTC)
    const rank = coinData?.market_cap_rank; // Global market rank of the crypto
    const coinDescription = coinData?.description?.en ?? "";
    const websiteUrl = coinData?.links?.homepage?.[0] || null;

    let news: Awaited<ReturnType<typeof getCoinNews>> = [];
    try {
        news = await getCoinNews(id);
    } catch {
        news = [];
    }

    // --- Market data ---
    const currentPrice = coinData?.market_data?.current_price?.cad; // Current price in CAD
    const priceChangePercentage = coinData?.market_data?.price_change_percentage_24h; // Value change in the past 24h in %
    const marketCap = coinData?.market_data?.market_cap?.cad; // Market capitalization in CAD
    const totalVolume = coinData?.market_data?.total_volume?.cad; // 24h trading volume in CAD
    const fdv = coinData?.market_data?.fully_diluted_valuation?.cad; // Fully Diluted Valuation (if all coins were in circulation)

    // --- Price stats ---
    const high24h = coinData?.market_data?.high_24h?.cad; // Highest price in the last 24h
    const low24h = coinData?.market_data?.low_24h?.cad; // Lowest price in the last 24h
    const ath = coinData?.market_data?.ath?.cad; // All-time high price
    const atl = coinData?.market_data?.atl?.cad; // All-time low price
    const athChangePercentage = coinData?.market_data?.ath_change_percentage?.cad; // % difference from ATH
    const atlChangePercentage = coinData?.market_data?.atl_change_percentage?.cad; // % difference from ATL
    const athDate = coinData?.market_data?.ath_date?.cad; // date string of the all-time high
    const atlDate = coinData?.market_data?.atl_date?.cad; // date string of the all-time low

    const formattedAthDate = new Date(athDate).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", });
    const formattedAtlDate = new Date(atlDate).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", });

    const high24hDiff = ((currentPrice - low24h) / (high24h - low24h)) * 100; // position in the 24h range
    const fromHigh24h = ((currentPrice - high24h) / high24h) * 100; // how far from 24h high
    const fromLow24h = ((currentPrice - low24h) / low24h) * 100; // how far from 24h low
    const PercentageChangeIn7d = coinData?.market_data?.price_change_percentage_7d ?? null; // % change in the past 7 days
    const price7dAgo = currentPrice / (1 + PercentageChangeIn7d / 100); // Price 7 days ago, based on the % change
    const priceDifferenceIn7d = currentPrice - price7dAgo; // Price diff

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
            <div className="flex flex-1 justify-center">
                {/* Main container */}
                <div className="flex w-[95%] gap-6 items-start">

                    {/* Right column - details */}
                    <div className="flex-[0.27] text-white p-8 text-xl rounded-[2px] shadow-md border-r border-white/20">

                        {/* Crypto Name and Logo */}
                        <div className="flex items-center gap-4 p-4">
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
                                <span className="text-lg text-white/60 uppercase">{symbole}</span>
                            </div>
                        </div>

                        {/* Current price */}
                        <div className="p-4 border-b border-white/10">
                            <span className="text-3xl">
                                ${currentPrice?.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                            </span>
                            <span
                                className={`text-2xl font-medium ml-3 ${priceChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {priceChangePercentage >= 0 ? "+" : ""}
                                {priceChangePercentage?.toFixed(2)}% (24h)
                            </span>
                        </div>

                        {/*------------- Market Stats -------------*/}
                        <div className="mt-6">
                            <h2 className="text-2xl text-white/90 mb-3">Market Stats</h2>
                            <div className="divide-y divide-white/10">
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">Market Cap</span>
                                    <span className="font-medium">${marketCap?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">Fully Diluted Valuation</span>
                                    <span className="font-medium">${fdv?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">24h Trading Volume</span>
                                    <span className="font-medium">${totalVolume?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">Rank</span>
                                    <span className="font-medium">#{rank}</span>
                                </div>
                            </div>
                        </div>

                        {/*------------- Price Performance -------------*/}
                        <div className="mt-8">
                            <h2 className="text-2xl text-white/90 mb-3">Price Performance</h2>
                            <div className="divide-y divide-white/10">

                                {/* 24h Range */}
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">24h Range</span>
                                    <span className="font-medium text-right">
                                        ${low24h?.toLocaleString("en-CA")} - ${high24h?.toLocaleString("en-CA")}
                                        <div className="text-base text-white/50">
                                            From Low: <span className={`${fromLow24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                {fromLow24h?.toFixed(2)}%
                                            </span> · From High:
                                            <span className={`${fromHigh24h >= 0 ? "text-green-500" : "text-red-500"} ml-1`}>
                                                {fromHigh24h?.toFixed(2)}%
                                            </span>
                                        </div>
                                    </span>
                                </div>

                                {/* 7-Day Range */}
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70 ">7-Day Change</span>
                                    <span
                                        className={`font-medium text-right ${priceDifferenceIn7d >= 0 ? "text-green-500" : "text-red-500"}`}
                                    >
                                        {PercentageChangeIn7d >= 0 ? "+" : ""}
                                        {PercentageChangeIn7d.toFixed(2)}%
                                        <span className="text-white/60 ml-1">
                                            ({priceDifferenceIn7d >= 0 ? "+" : "-"}{Math.abs(priceDifferenceIn7d).toLocaleString("en-CA", {
                                                style: "currency",
                                                currency: "CAD",
                                                maximumFractionDigits: 0,
                                            })})
                                        </span>
                                    </span>
                                </div>

                                {/* All-Time High */}
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">All-Time High</span>
                                    <span className="font-medium text-right">
                                        ${ath?.toLocaleString("en-CA")}
                                        <span className={`ml-2 ${athChangePercentage < 0 ? "text-red-500" : "text-green-500"}`}>
                                            {athChangePercentage?.toFixed(2)}%
                                        </span>
                                        <div className="text-base text-white/50">{formattedAthDate}</div>
                                    </span>
                                </div>

                                {/* All-Time Low */}
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">All-Time Low</span>
                                    <span className="font-medium text-right">
                                        ${atl?.toLocaleString("en-CA")}
                                        <span className={`ml-2 ${atlChangePercentage < 0 ? "text-red-500" : "text-green-500"}`}>
                                            {atlChangePercentage?.toFixed(2)}%
                                        </span>
                                        <div className="text-base text-white/50">{formattedAtlDate}</div>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ------------- Supply Metrics ------------- */}
                        <div className="mt-8">
                            <h2 className="text-2xl text-white/90 mb-3">Supply Metrics</h2>
                            <div className="divide-y divide-white/10">
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">Circulating Supply</span>
                                    <span className="font-medium">{circulatingSupply?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">Total Supply</span>
                                    <span className="font-medium">{totalSupply?.toLocaleString("en-CA")}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white/70">Max Supply</span>
                                    <span className="font-medium">{maxSupply?.toLocaleString("en-CA")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left column - chart + risk analysis */}
                    <div className="flex-[0.73] flex flex-col gap-6">

                        {/* Chart container */}
                        <div className="text-white p-8 rounded-[4px] shadow-md overflow-hidden relative">
                            <div className="w-full min-h-[700px]">
                                <CoinChart coinId={params.id} currency="cad" />
                            </div>
                        </div>

                        {/* ------------- Description ------------- */}
                        <div className="mt-8">
                            <div className="flex items-baseline justify-between mb-3">
                                <h2 className="text-2xl text-white/90">Description</h2>
                                {websiteUrl ? (
                                    <a
                                        href={websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-md text-white/70 hover:underline"
                                    >
                                        Official site
                                    </a>
                                ) : null}
                            </div>

                            <details className="group bg-[#12141A] border border-white/10 rounded-md">
                                <summary className="cursor-pointer list-none px-4 py-3 text-white/80 hover:text-white/95 select-none">
                                    <span className="mr-2">About {name}</span>
                                    <span className="text-white/50 group-open:hidden">· Show more</span>
                                    <span className="text-white/50 hidden group-open:inline">· Show less</span>
                                </summary>
                                <div className="px-4 pb-4">
                                    <div
                                        className="text-white/85 leading-relaxed"
                                        style={{ textAlign: "justify", textJustify: "inter-word" }}
                                        dangerouslySetInnerHTML={{ __html: coinDescription }}
                                    />
                                </div>
                            </details>
                        </div>

                        {/*------------- Gauges Section -------------*/}
                        <div className="flex flex-wrap justify-between gap-6 w-full mt-6">

                            {/* === Left: Specific Coin Volatility === */}
                            <div className="flex-1 min-w-[250px] p-6 rounded-[8px] shadow-md">
                                <h2 className="text-2xl text-white mb-6 text-center">Volatility Index</h2>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-lg text-white/80 mb-3">{name}</h3>
                                    <RiskGauge value={Math.round(riskScore)} />
                                    <p className="text-white/60 text-sm mt-3">
                                        Based on 7-day change: {Math.round(PercentageChangeIn7d)}%
                                    </p>
                                </div>
                            </div>

                            {/* === Right: Market Overview (Fear & Greed + Global) === */}
                            <div className="flex-[1.9] min-w-[550px] p-6 rounded-[8px] shadow-md">
                                <h2 className="text-2xl text-white mb-6 text-center">Market Overview</h2>

                                <div className="flex justify-center gap-10 flex-wrap">
                                    {/* Fear & Greed */}
                                    <div className="flex flex-col items-center w-64">
                                        <h3 className="text-lg text-white/80 mb-3">Market Sentiment</h3>
                                        <RiskGauge value={Math.round(fearGreedValue)} />
                                        <p className="text-sm text-white/60 mt-2">{fearGreedLabel}</p>
                                    </div>

                                    {/* Global Market */}
                                    <div className="flex flex-col items-center w-64">
                                        <h3 className="text-lg text-white/80 mb-3">Global Market</h3>
                                        <RiskGauge value={Math.round(marketHealth)} />
                                        <p className="text-sm text-white/60 mt-2">
                                            {
                                                marketHealth >= 55
                                                    ? "Growing"   // If marketHealth ≥ 55 = market performing well
                                                    : marketHealth <= 45
                                                        ? "Cooling"   // If marketHealth ≤ 45 = market slowing down
                                                        : "Stable"    // Otherwise (45–55) = neutral 
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="text-white p-6 rounded-[8px] shadow-md">
                            <h2 className="text-2xl mb-4">Latest updates</h2>
                            <CoinDailyNews coinId={id} />
                        </div>
                    </div>
                </div>
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