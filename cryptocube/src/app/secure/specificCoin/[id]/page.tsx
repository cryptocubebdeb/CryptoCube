import Image from "next/image";
import { getCoin } from '../../../lib/getCoin';
import { Geologica } from "next/font/google"
import { getCoinChart } from "../../../lib/getCoinChart";
import CoinChart from "../../../../app/secure/components/CoinChart";

const geologica = Geologica({ subsets: ["latin"], weight: ["400", "700"] });

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {

    const { id } = await params; // id example "bitcoin"

    const [coinData, series] = await Promise.all([
        getCoin(id),
        getCoinChart(id, 30, "cad"),
    ]);

    // --- Basic coin info ---
    const name = coinData?.name ?? id; // Name of the current crypto
    const logo = coinData?.image?.large as string | undefined; // Image of the crypto logo
    const symbole = coinData?.symbol ?? id; // Acronym of the crypto (ex: Bitcoin → BTC)
    const rank = coinData?.market_cap_rank; // Global market rank of the crypto

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
    const PercentageChangeIn7d = coinData?.market_data?.price_change_percentage_7d ?? null;
    const price7dAgo = currentPrice / (1 + PercentageChangeIn7d / 100);
    const priceDifferenceIn7d = currentPrice - price7dAgo;




    // --- Supply metrics ---
    const circulatingSupply = coinData?.market_data?.circulating_supply; // Number of coins currently in circulation
    const totalSupply = coinData?.market_data?.total_supply; // Total number of coins issued
    const maxSupply = coinData?.market_data?.max_supply; // Maximum possible number of coins

    return (
        <div className={`h-screen flex flex-col ${geologica.className}`}>
            <div className="flex flex-1 justify-center">
                {/* Main container */}
                <div className="flex w-[95%] gap-2 items-start">

                    {/* Left column - chart */}
                    <div className="flex-[0.65] bg-[#15171E] text-white p-8 rounded-[2px] shadow-md">
                        <CoinChart coinId={id} days={30} currency="cad" />
                    </div>

                    {/* Right column - details */}
                    <div className="flex-[0.35] bg-[#15171E] text-white p-8 text-xl rounded-[2px] shadow-md">

                        {/* Crypto Name and Logo */}
                        <div className="flex items-center gap-4 p-4">
                            {logo && (
                                <Image
                                    src={logo}
                                    alt={`${name} logo`}
                                    width={50}
                                    height={50}
                                    className="rounded"
                                    priority
                                />
                            )}
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-4xl">{name}</h1>
                                <span className="text-lg text-white/60 uppercase">{symbole}</span>
                            </div>
                        </div>

                        {/* Current price */}
                        <div className="p-4 border-b border-white/10">
                            <span className="text-5xl">
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