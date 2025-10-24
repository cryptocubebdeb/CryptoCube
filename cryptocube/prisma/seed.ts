import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
console.log(Object.keys(prisma));


async function main() {
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // --- USERS ---
  const alice = await prisma.utilisateur.upsert({
    where: { email: "alice@outlook.com" },
    update: {},
    create: {
      email: "alice@outlook.com",
      motDePasse: hashedPassword,
      nom: "Leblanc",
      prenom: "Alice",
      username: "aliceleblanc05",
    },
  });

  const john = await prisma.utilisateur.upsert({
    where: { email: "johndoe@outlook.com" },
    update: {},
    create: {
      email: "johndoe@outlook.com",
      motDePasse: hashedPassword,
      nom: "Doe",
      prenom: "John",
      username: "johndoe03",
    },
  });

  const jane = await prisma.utilisateur.upsert({
    where: { email: "janedoe@outlook.com" },
    update: {},
    create: {
      email: "janedoe@outlook.com",
      motDePasse: hashedPassword,
      nom: "Doe",
      prenom: "Jane",
      username: "janedoe06",
    },
  });

  console.log("[SEED] Successfully created users", { alice, john, jane });

  // --- WATCHLIST ITEMS ---
  await prisma.watchlistItem.createMany({
    data: [
      // Alice’s watchlist
      { userId: alice.id, coinId: "bitcoin" },
      { userId: alice.id, coinId: "ethereum" },
      { userId: alice.id, coinId: "solana" },

      // John’s watchlist
      { userId: john.id, coinId: "bitcoin" },
      { userId: john.id, coinId: "dogecoin" },
      { userId: john.id, coinId: "cardano" },

      // Jane’s watchlist
      { userId: jane.id, coinId: "avalanche-2" },
      { userId: jane.id, coinId: "polkadot" },
      { userId: jane.id, coinId: "chainlink" },
    ],
    skipDuplicates: true,
  });

  console.log("[SEED] Successfully created watchlist items");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("[SEED] Failed to seed data", e);
    await prisma.$disconnect();
    process.exit(1);
  });
