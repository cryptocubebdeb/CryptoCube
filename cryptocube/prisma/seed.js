// prisma/seed.js
import { PrismaClient, TradeType, OrderKind, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
      { userId: alice.id, coinId: "bitcoin" },
      { userId: alice.id, coinId: "ethereum" },
      { userId: alice.id, coinId: "solana" },

      { userId: john.id, coinId: "bitcoin" },
      { userId: john.id, coinId: "dogecoin" },
      { userId: john.id, coinId: "cardano" },

      { userId: jane.id, coinId: "avalanche-2" },
      { userId: jane.id, coinId: "polkadot" },
      { userId: jane.id, coinId: "chainlink" }
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

  // REALISTIC MATCHABLE ORDERS
  await prisma.order.createMany({
    data: [
      // BTC (~96k)
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "BTC",
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 0.01,
        price: 96000, // matchable
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "BTC",
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 0.005,
        price: 90000 // not matchable
      },
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "BTC",
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 0.02,
        price: 94000, // matchable
        status: OrderStatus.PENDING
      }
    ]
  });

  // ETH (~3200)
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "ETH",
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 0.5,
        price: 3300, // matchable
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "ETH",
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 1.2,
        price: 3100, // matchable
        status: OrderStatus.PENDING
      }
    ]
  });

  // DOGE (~0.16)
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "DOGE",
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 1500,
        price: 0.17, // matchable
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "DOGE",
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 2000,
        price: 0.155, // matchable
        status: OrderStatus.PENDING
      }
    ]
  });

  // DOT (~7)
  await prisma.order.createMany({
    data: [
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "DOT",
        orderType: TradeType.BUY,
        orderKind: OrderKind.LIMIT,
        amount: 30,
        price: 7.2, // matchable
        status: OrderStatus.PENDING
      },
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "DOT",
        orderType: TradeType.SELL,
        orderKind: OrderKind.LIMIT,
        amount: 40,
        price: 6.9, // matchable
        status: OrderStatus.PENDING
      }
    ]
  });

  console.log("[SEED] Orders created");
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
