// /scripts/dailySnapshot.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fetch all Binance tickers in one request.
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
 * Converts a coin symbol (BTC) or trading symbol (BTCUSDT)
 * into a valid Binance ticker.
 */
function toBinanceSymbol(coinSymbol) {
  coinSymbol = coinSymbol.toUpperCase();

  // Already a valid Binance ticker
  if (coinSymbol.endsWith("USDT")) {
    return coinSymbol;
  }

  // Convert raw coin symbol
  return `${coinSymbol}USDT`;
}

async function runSnapshot() {
  console.log("Running daily snapshot using Binance market prices...");

  // Load all Binance prices once
  const priceMap = await fetchBinancePrices();

  // Load all simulator accounts including the user info
  const accounts = await prisma.simulatorAccount.findMany({
    include: {
      portfolio: true,
      user: true, 
    },
  });

  for (const account of accounts) {
    let portfolioValue = 0;

    // Sum all portfolio positions
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

    // Save snapshot
    await prisma.portfolioHistory.create({
      data: {
        simulatorAccountId: account.id,
        totalValueUsd: totalValue,
      },
    });

    console.log(
      `Snapshot saved for account ${account.id} (user: ${account.user.email || account.userId}): $${totalValue.toFixed(2)}`
    );
  }

  console.log("Daily Snapshot completed.");
  process.exit();
}

runSnapshot().catch((err) => {
  console.error("Snapshot error:", err);
  process.exit(1);
});
