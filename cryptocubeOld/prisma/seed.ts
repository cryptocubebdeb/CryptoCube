import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
 
const prisma = new PrismaClient();
 
async function main() {
  const hashedPassword = await bcrypt.hash("Password123!", 10);
 
  // --- USERS ---
  const [alice, john, jane] = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@outlook.com" },
      update: {},
      create: {
        email: "alice@outlook.com",
        passwordHash: hashedPassword,
        name: "Leblanc",
        prenom: "Alice",
        username: "aliceleblanc05",
      },
    }),
    prisma.user.upsert({
      where: { email: "johndoe@outlook.com" },
      update: {},
      create: {
        email: "johndoe@outlook.com",
        passwordHash: hashedPassword,
        name: "Doe",
        prenom: "John",
        username: "johndoe03",
      },
    }),
    prisma.user.upsert({
      where: { email: "janedoe@outlook.com" },
      update: {},
      create: {
        email: "janedoe@outlook.com",
        passwordHash: hashedPassword,
        name: "Doe",
        prenom: "Jane",
        username: "janedoe06",
      },
    }),
  ]);
 
  console.log("[SEED] Created users");
 
  // --- WATCHLIST ITEMS ---
  await prisma.watchlistItem.createMany({
    data: [
      // Alice
      { userId: alice.id, coinId: "bitcoin" },
      { userId: alice.id, coinId: "ethereum" },
      { userId: alice.id, coinId: "solana" },
 
      // John
      { userId: john.id, coinId: "bitcoin" },
      { userId: john.id, coinId: "dogecoin" },
      { userId: john.id, coinId: "cardano" },
 
      // Jane
      { userId: jane.id, coinId: "avalanche-2" },
      { userId: jane.id, coinId: "polkadot" },
      { userId: jane.id, coinId: "chainlink" },
    ],
    skipDuplicates: true,
  });
  console.log("[SEED] Watchlists created");
 
  // --- SIMULATOR ACCOUNTS ---
  const [aliceSim, johnSim, janeSim] = await Promise.all([
    prisma.simulatorAccount.upsert({
      where: { userId: alice.id },
      update: {},
      create: {
        userId: alice.id,
        initialCashBalance: 75000.0,
        currentCashBalance: 60200.0,
        realizedProfitUsd: 1480.5,
      },
    }),
    prisma.simulatorAccount.upsert({
      where: { userId: john.id },
      update: {},
      create: {
        userId: john.id,
        initialCashBalance: 50000.0,
        currentCashBalance: 48200.0,
        realizedProfitUsd: -320.3,
      },
    }),
    prisma.simulatorAccount.upsert({
      where: { userId: jane.id },
      update: {},
      create: {
        userId: jane.id,
        initialCashBalance: 100000.0,
        currentCashBalance: 91500.0,
        realizedProfitUsd: 250.0,
      },
    }),
  ]);
  console.log("[SEED] Simulator accounts created");
 
  // --- PORTFOLIOS ---
  await prisma.portfolio.createMany({
    data: [
      // Alice’s holdings
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "BTC",
        amountOwned: 0.8,
        averageEntryPriceUsd: 39000.0,
      },
      {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "ETH",
        amountOwned: 5.2,
        averageEntryPriceUsd: 2200.0,
      },
 
      // John’s holdings
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "DOGE",
        amountOwned: 2500,
        averageEntryPriceUsd: 0.07,
      },
      {
        simulatorAccountId: johnSim.id,
        coinSymbol: "ADA",
        amountOwned: 800,
        averageEntryPriceUsd: 0.45,
      },
 
      // Jane’s holdings
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "SOL",
        amountOwned: 30,
        averageEntryPriceUsd: 110.0,
      },
      {
        simulatorAccountId: janeSim.id,
        coinSymbol: "DOT",
        amountOwned: 120,
        averageEntryPriceUsd: 6.5,
      },
    ],
    skipDuplicates: true,
  });
  console.log("[SEED] Portfolios created");
 
  // --- ORDERS ---
  const [aliceOrder, johnOrder, janeOrder] = await Promise.all([
    prisma.order.create({
      data: {
        simulatorAccountId: aliceSim.id,
        coinSymbol: "BTC",
        orderType: "BUY",
        orderKind: "LIMIT",
        amount: 0.2,
        price: 38000.0,
        status: "PENDING",
      },
    }),
    prisma.order.create({
      data: {
        simulatorAccountId: johnSim.id,
        coinSymbol: "DOGE",
        orderType: "SELL",
        orderKind: "MARKET",
        amount: 500,
        price: null,
        status: "EXECUTED",
      },
    }),
    prisma.order.create({
      data: {
        simulatorAccountId: janeSim.id,
        coinSymbol: "DOT",
        orderType: "BUY",
        orderKind: "LIMIT",
        amount: 60,
        price: 5.5,
        status: "PENDING",
      },
    }),
  ]);
  console.log("[SEED] Orders created");
 
  // --- TRADE HISTORY ---
  await prisma.tradeHistory.createMany({
    data: [
      // Alice executed past trades
      {
        simulatorAccountId: aliceSim.id,
        orderId: aliceOrder.id,
        tradeType: "BUY",
        coinSymbol: "BTC",
        amountTraded: 0.1,
        tradePrice: 39500.0,
        tradeTotal: 3950.0,
      },
      {
        simulatorAccountId: aliceSim.id,
        tradeType: "SELL",
        coinSymbol: "ETH",
        amountTraded: 1.0,
        tradePrice: 2450.0,
        tradeTotal: 2450.0,
      },
 
      // John’s history
      {
        simulatorAccountId: johnSim.id,
        orderId: johnOrder.id,
        tradeType: "SELL",
        coinSymbol: "DOGE",
        amountTraded: 500.0,
        tradePrice: 0.075,
        tradeTotal: 37.5,
      },
 
      // Jane’s history
      {
        simulatorAccountId: janeSim.id,
        tradeType: "BUY",
        coinSymbol: "SOL",
        amountTraded: 10.0,
        tradePrice: 120.0,
        tradeTotal: 1200.0,
      },
      {
        simulatorAccountId: janeSim.id,
        tradeType: "SELL",
        coinSymbol: "DOT",
        amountTraded: 20.0,
        tradePrice: 6.8,
        tradeTotal: 136.0,
      },
    ],
  });
  console.log("[SEED] Trade history created");
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