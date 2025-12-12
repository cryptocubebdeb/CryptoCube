// /scripts/dailySnapshot.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fetch Binance symbols in one request
 */
async function fetchBinancePrices() {
  const res = await fetch("https://api.binance.com/api/v3/ticker/price");
  const data = await res.json();

  const priceMap = {};
  for (const item of data) {
    priceMap[item.symbol] = parseFloat(item.price);
  }

  return priceMap;
}

/**
 * Converts a simulator coinSymbol to a Binance trading pair.
 */
function toBinanceSymbol(coinSymbol) {
  return `${coinSymbol.toUpperCase()}USDT`;
}

async function runSnapshot() {
  console.log("Running daily snapshot using Binance market prices...");

  // Load ALL Binance prices globally
  const priceMap = await fetchBinancePrices();

  // Load all simulator accounts + their portfolios
  const accounts = await prisma.simulatorAccount.findMany({
    include: {
      portfolio: true,
    },
  });

  for (const account of accounts) {
    let portfolioValue = 0;

    for (const item of account.portfolio) {
      const symbol = toBinanceSymbol(item.coinSymbol);
      const priceUsd = priceMap[symbol];

      if (!priceUsd) {
        console.warn(`Missing price for symbol ${symbol}, skipping`);
        continue;
      }

      portfolioValue += Number(item.amountOwned) * priceUsd;
    }

    const totalValue =
      Number(account.currentCashBalance) + portfolioValue;

    await prisma.portfolioHistory.create({
      data: {
        simulatorAccountId: account.id,
        totalValueUsd: totalValue,
      },
    });

    console.log(
      `Snapshot saved for account ${account.id}: $${totalValue.toFixed(2)}`
    );
  }

  console.log("Daily Snapshot completed.");
  process.exit();
}

runSnapshot().catch((err) => {
  console.error("Snapshot error:", err);
  process.exit(1);
});
