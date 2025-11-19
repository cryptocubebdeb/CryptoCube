import { PrismaClient, OrderStatus } from "@prisma/client";
import { orderWorkerManager } from "./orderWorkerManager.js";

const prismaClient = new PrismaClient();

// This function runs automatically when the backend starts.
async function startWorkersOnStartup() {

    console.log("Starting ALL workers...");

    // Find all distinct coin symbols that have pending orders
    const pendingCoins = await prismaClient.order.findMany({
        where: {
            status: OrderStatus.PENDING
        },
        select: {
            coinSymbol: true
        },
        distinct: ["coinSymbol"]
    });

    // For each coin symbol, start a worker
    for (const record of pendingCoins) {

        const coinSymbol = record.coinSymbol;

        await orderWorkerManager.onNewOrder(coinSymbol);
    }

    console.log("Workers initialized.");
}


/*
    This is the entrypoint of this worker startup script.
    If something goes wrong during initialization,
    we log the full error and exit the process.
*/
startWorkersOnStartup().catch((error) => {
    console.error("Fatal worker startup error:", error);
    process.exit(1);
});
