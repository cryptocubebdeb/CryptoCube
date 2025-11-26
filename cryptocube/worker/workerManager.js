import { PrismaClient, OrderStatus } from "@prisma/client";
import { createSymbolWorker } from "./coinWorker.js";

const prismaClient = new PrismaClient();

/*
    This class controls all the background workers.
    A worker listens to Binance for one coin and tries to match pending orders for that coin.
*/
class OrderWorkerManager {
    constructor() {
        this.activeWorkers = new Map(); // key: coinSymbol, value: worker instance

        /*
            DYNAMIC SPAWNING LOOP
            Every 2 seconds, we check the database for new coins
            that have pending orders but do NOT have a worker yet.
        */
        setInterval(() => this.scanForNewCoins(), 2000);
    }

    // ================================
    //  CREATE WORKER FOR A COIN
    // ================================
    async startWorkerForCoin(coinSymbol) {
        // If worker already exists, skip
        if (this.activeWorkers.has(coinSymbol)) return;

        console.log("[WORKER-MANAGER] Starting worker for " + coinSymbol);

        const workerInstance = createSymbolWorker(coinSymbol);

        this.activeWorkers.set(coinSymbol, workerInstance);
    }

    // ===================================================
    //  CALLED IN YOUR APP WHEN A NEW ORDER IS CREATED
    // ===================================================
    async onNewOrder(coinSymbol) {
        // Dynamic auto-start happens anyway, but this guarantees instant start
        await this.startWorkerForCoin(coinSymbol);
    }

    // ===================================================
    //  AUTO-DETECT NEW COINS WITH PENDING ORDERS
    // ===================================================
    async scanForNewCoins() {
        try {
            // Find all coins that currently have at least 1 pending order
            const coinsWithPending = await prismaClient.order.findMany({
                where: { status: OrderStatus.PENDING },
                select: { coinSymbol: true },
                distinct: ["coinSymbol"]
            });

            for (const { coinSymbol } of coinsWithPending) {

                // If we don't have a worker for this coin, create one automatically
                if (!this.activeWorkers.has(coinSymbol)) {
                    console.log("[WORKER-MANAGER] Auto-detected new coin needing worker:", coinSymbol);
                    await this.startWorkerForCoin(coinSymbol);
                }
            }

            // Also clean up workers for coins that no longer have pending orders
            await this.cleanupIdleWorkers();
        } catch (err) {
            console.error("[WORKER-MANAGER] scanForNewCoins error:", err);
        }
    }

    // ===================================================
    //  STOP WORKER IF COIN HAS NO MORE PENDING ORDERS
    // ===================================================
    async checkIfWorkerShouldStop(coinSymbol) {
        const pendingCount = await prismaClient.order.count({
            where: {
                coinSymbol,
                status: OrderStatus.PENDING
            }
        });

        if (pendingCount === 0) {
            console.log("[WORKER-MANAGER] Stopping worker for coin:", coinSymbol);
            this.stopWorker(coinSymbol);
        }
    }

    // ===================================================
    //  STOP A WORKER INSTANCE
    // ===================================================
    stopWorker(coinSymbol) {
        const workerInstance = this.activeWorkers.get(coinSymbol);

        if (workerInstance && typeof workerInstance.stop === "function") {
            workerInstance.stop();
        }

        this.activeWorkers.delete(coinSymbol);
    }

    // ===================================================
    //  AUTOMATICALLY CLEAN UP ALL IDLE WORKERS
    // ===================================================
    async cleanupIdleWorkers() {
        for (const [coinSymbol] of this.activeWorkers.entries()) {
            const pendingCount = await prismaClient.order.count({
                where: { coinSymbol, status: OrderStatus.PENDING }
            });

            if (pendingCount === 0) {
                console.log("[WORKER-MANAGER] Auto-cleaning idle worker for:", coinSymbol);
                this.stopWorker(coinSymbol);
            }
        }
    }
}

// Export a single shared instance used everywhere in the backend
export const orderWorkerManager = new OrderWorkerManager();
