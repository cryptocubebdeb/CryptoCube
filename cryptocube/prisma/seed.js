// prisma/seed.js
import { PrismaClient, TradeType, OrderKind, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Map of tickers to CoinGecko IDs.
 * This prevents mistakes and keeps everything consistent.
 */
const COINS = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  solana: "solana",
  dogecoin: "dogecoin",
  cardano: "cardano",
  avalanche: "avalanche-2",
  polkadot: "polkadot",
  chainlink: "chainlink"
};

async function main() {
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // USERS
  const [alice, john, jane] = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@outlook.com" },
      update: {},
      create: {
        email: "alice@outlook.com",
        passwordHash: hashedPassword,
        lastName: "Leblanc",
        firstName: "Alice",
        username: "aliceleblanc05"
      }
    }),
    prisma.user.upsert({
      where: { email: "johndoe@outlook.com" },
      update: {},
      create: {
        email: "johndoe@outlook.com",
        passwordHash: hashedPassword,
        lastName: "Doe",
        firstName: "John",
        username: "johndoe03"
      }
    }),
    prisma.user.upsert({
      where: { email: "janedoe@outlook.com" },
      update: {},
      create: {
        email: "janedoe@outlook.com",
        passwordHash: hashedPassword,
        lastName: "Doe",
        firstName: "Jane",
        username: "janedoe06"
      }
    })
  ]);

  console.log("[SEED] Users created");

  // WATCHLISTS
  await prisma.watchlistItem.createMany({
    data: [
      { userId: alice.id, coinId: COINS.bitcoin },
      { userId: alice.id, coinId: COINS.ethereum },
      { userId: alice.id, coinId: COINS.solana },

      { userId: john.id, coinId: COINS.bitcoin },
      { userId: john.id, coinId: COINS.dogecoin },
      { userId: john.id, coinId: COINS.cardano },

      { userId: jane.id, coinId: COINS.avalanche },
      { userId: jane.id, coinId: COINS.polkadot },
      { userId: jane.id, coinId: COINS.chainlink }
    ],
    skipDuplicates: true
  });

  console.log("[SEED] Watchlists created");

  // SIMULATOR ACCOUNTS
  const [aliceSim, johnSim, janeSim] = await Promise.all([
    prisma.simulatorAccount.upsert({
      where: { userId: alice.id },
      update: {},
      create: {
        userId: alice.id,
        initialCashBalance: 75000,
        currentCashBalance: 75000
      }
    }),
    prisma.simulatorAccount.upsert({
      where: { userId: john.id },
      update: {},
      create: {
        userId: john.id,
        initialCashBalance: 50000,
        currentCashBalance: 50000
      }
    }),
    prisma.simulatorAccount.upsert({
      where: { userId: jane.id },
      update: {},
      create: {
        userId: jane.id,
        initialCashBalance: 100000,
        currentCashBalance: 100000
      }
    })
  ]);

  console.log("[SEED] Simulator accounts created");

  // =============================
  // PORTFOLIO ENTRIES
  // =============================
  await prisma.portfolio.createMany({
    data: [
      // Alice owns some BTC + ETH + SOL
      {
        simulatorAccountId: aliceSim.id,
        coinId: COINS.bitcoin,
        coinSymbol: "BTC",
        amountOwned: 0.02,
        averageEntryPriceUsd: 95000
      },
      {
        simulatorAccountId: aliceSim.id,
        coinId: COINS.ethereum,
        coinSymbol: "ETH",
        amountOwned: 0.4,
        averageEntryPriceUsd: 3000
      },
      {
        simulatorAccountId: aliceSim.id,
        coinId: COINS.solana,
        coinSymbol: "SOL",
        amountOwned: 3,
        averageEntryPriceUsd: 160
      },

      // John portfolio
      {
        simulatorAccountId: johnSim.id,
        coinId: COINS.bitcoin,
        coinSymbol: "BTC",
        amountOwned: 0.005,
        averageEntryPriceUsd: 91000
      },
      {
        simulatorAccountId: johnSim.id,
        coinId: COINS.dogecoin,
        coinSymbol: "DOGE",
        amountOwned: 500,
        averageEntryPriceUsd: 0.12
      },

      // Jane portfolio
      {
        simulatorAccountId: janeSim.id,
        coinId: COINS.polkadot,
        coinSymbol: "DOT",
        amountOwned: 50,
        averageEntryPriceUsd: 7.5
      },
      {
        simulatorAccountId: janeSim.id,
        coinId: COINS.chainlink,
        coinSymbol: "LINK",
        amountOwned: 20,
        averageEntryPriceUsd: 14
      }
    ],
    skipDuplicates: true
  });

  console.log("[SEED] Portfolio created");

  // ==============
  // REALISTIC ORDERS
  // ==============

  // BTC
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "BTC",
        coinId: COINS.bitcoin,
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 0.01,
        price: 96000,
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "BTC",
        coinId: COINS.bitcoin,
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 0.005,
        price: 90000
      },
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "BTC",
        coinId: COINS.bitcoin,
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 0.02,
        price: 94000,
        status: OrderStatus.PENDING
      }
    ]
  });

  // ETH
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "ETH",
        coinId: COINS.ethereum,
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 0.5,
        price: 3300,
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "ETH",
        coinId: COINS.ethereum,
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 1.2,
        price: 3100,
        status: OrderStatus.PENDING
      }
    ]
  });

  // DOGE
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "DOGE",
        coinId: COINS.dogecoin,
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 1500,
        price: 0.17,
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "DOGE",
        coinId: COINS.dogecoin,
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 2000,
        price: 0.155,
        status: OrderStatus.PENDING
      }
    ]
  });

  // DOT
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "DOT",
        coinId: COINS.polkadot,
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 30,
        price: 7.2,
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "DOT",
        coinId: COINS.polkadot,
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 40,
        price: 6.9,
        status: OrderStatus.PENDING
      }
    ]
  });

  console.log("[SEED] Orders created");

// =============================
// TRADE HISTORY (EXECUTED TRADES)
// =============================
console.log("[SEED] Creating trade history...");

await prisma.tradeHistory.createMany({
  data: [
    // ===== ALICE =====
    {
      simulatorAccountId: aliceSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "BTC",
      amountTraded: 0.02,
      tradePrice: 95000,
      tradeTotal: 0.02 * 95000,
      executedAt: new Date("2024-03-12"),
    },
    {
      simulatorAccountId: aliceSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "ETH",
      amountTraded: 0.4,
      tradePrice: 3000,
      tradeTotal: 0.4 * 3000,
      executedAt: new Date("2024-05-02"),
    },
    {
      simulatorAccountId: aliceSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "SOL",
      amountTraded: 3,
      tradePrice: 160,
      tradeTotal: 3 * 160,
      executedAt: new Date("2024-06-15"),
    },

    // ===== JOHN =====
    {
      simulatorAccountId: johnSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "BTC",
      amountTraded: 0.005,
      tradePrice: 91000,
      tradeTotal: 0.005 * 91000,
      executedAt: new Date("2024-04-01"),
    },
    {
      simulatorAccountId: johnSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "DOGE",
      amountTraded: 500,
      tradePrice: 0.12,
      tradeTotal: 500 * 0.12,
      executedAt: new Date("2024-02-20"),
    },

    // ===== JANE =====
    {
      simulatorAccountId: janeSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "DOT",
      amountTraded: 50,
      tradePrice: 7.5,
      tradeTotal: 50 * 7.5,
      executedAt: new Date("2024-03-08"),
    },
    {
      simulatorAccountId: janeSim.id,
      tradeType: TradeType.BUY,
      coinSymbol: "LINK",
      amountTraded: 20,
      tradePrice: 14,
      tradeTotal: 20 * 14,
      executedAt: new Date("2024-06-01"),
    },
    {
      simulatorAccountId: janeSim.id,
      tradeType: TradeType.SELL,
      coinSymbol: "LINK",
      amountTraded: 5,
      tradePrice: 16.2,
      tradeTotal: 5 * 16.2,
      executedAt: new Date("2024-09-10"),
    },
  ],
});

console.log("[SEED] Trade history created");


  // =============================
  // MASSIVE PORTFOLIO HISTORY (730 days) FOR ALICE + JOHN
  // =============================
  console.log("[SEED] Generating massive portfolio history for Alice & John...");

  const days = 730; // 2 years
  const now = new Date();

  /**
   * Simulates price movement with realistic volatility.
   */
  function randomWalk(base, volatility = 0.04) {
    const change = (Math.random() - 0.5) * volatility; // ±4%
    const next = base * (1 + change);
    return Math.max(next, 50); // never below 50$
  }

  // ========== ALICE ==========
  let aliceValue = 75000;
  const aliceHistory = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);

    aliceValue = randomWalk(aliceValue);

    aliceHistory.push({
      simulatorAccountId: aliceSim.id,
      totalValueUsd: aliceValue,
      createdAt: date,
    });
  }

  // ========== JOHN ==========
  let johnValue = 50000;
  const johnHistory = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);

    johnValue = randomWalk(johnValue);

    johnHistory.push({
      simulatorAccountId: johnSim.id,
      totalValueUsd: johnValue,
      createdAt: date,
    });
  }

  // Insert both large datasets
  await prisma.portfolioHistory.createMany({
    data: [...aliceHistory, ...johnHistory],
  });

  console.log(
    `[SEED] Portfolio history created: ${aliceHistory.length + johnHistory.length} entries (Alice + John)`
  );
}

main()
  .then(async () => {
    console.log("[SEED] Database seeding complete!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("[SEED] Failed to seed data", e);
    await prisma.$disconnect();
    process.exit(1);
  });
