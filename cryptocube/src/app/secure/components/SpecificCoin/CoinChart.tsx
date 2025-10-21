// /app/secure/components/CoinChart.tsx
import { getCoinChart } from "../../../lib/getCoinChart";
import LineChart from "./LineChart";

type RawPoint = { time: number; price: number };
type Point = { x: number; y: number }; //each point in the graphic must have a price for a specific time

type params = {
  coinId: string;
  days?: number;       // default 30
  currency?: string;   // default "cad"
};

export default async function CoinChart({coinId, days = 30, currency = "cad",}: params) {
  
    //Table of all the points fetched from the api. Const because we never want to change the data
    const raw: RawPoint[] = await getCoinChart(coinId, days, currency);

    const data: Point[] = raw.map(p => ({ x: p.time, y: p.price }));

  return <LineChart width={1500} height={500} data={data} />;
}


