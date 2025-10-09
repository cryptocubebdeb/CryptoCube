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

    const name = coinData?.name ?? id; //Name of the current crypto
    const logo = coinData?.image?.large as string | undefined; //Image of the crypto logo
    const symbole = coinData?.symbol ?? id; //Acronyme of the crypto Ex.: Bitcoin is btc
    const currentPrice = coinData?.market_data.current_price.cad; //Current price
    const priceChangePercentage = coinData?.market_data.price_change_percentage_24h; //Value change in the past 24h in %

    return (
        <div className={`h-screen flex flex-col ${geologica.className}`}>
            <div className="flex flex-col flex-1 items-center">
                <div className="w-[85%]">
                    <div className="flex justify-between items-center gap-4">
                        {/* Chart section */}
                        <div className="flex-[0.7] bg-[#15171E] text-white p-8 rounded-[2px] shadow-md">
                            <CoinChart coinId={id} days={30} currency="cad" />
                        </div>

                        {/* Details section */}
                        <div className="flex-[0.3] bg-[#15171E] text-white p-8 rounded-[2px] shadow-md">

                            {/* Crypto Name and Logo */}
                            <div className="flex items-center gap-4 p-4">
                                {logo && (
                                    <Image
                                        src={logo}
                                        alt={`${name} logo`}
                                        width={48}
                                        height={48}
                                        className="rounded"
                                        priority
                                    />
                                )}
                                <div className="flex items-baseline gap-2">

                                    {/* Coin name and symbol */}
                                    <h1 className="text-3xl">{name}</h1>
                                    <span className="text-lg text-white/60 uppercase">{symbole}</span>
                                </div>
                            </div>
                            <div>
                                {/* Current price */}
                                <span className="text-2xl ml-4">
                                    ${currentPrice.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                                </span>

                                {/* 24h change */}
                                <span
                                    className={`text-xl ml-2 ${priceChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {priceChangePercentage >= 0 ? "+" : ""}
                                    {priceChangePercentage.toFixed(2)}% (24h)
                                </span>
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