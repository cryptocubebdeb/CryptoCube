import { PrismaClient, OrderStatus } from "@prisma/client";
import { createSymbolWorker } from "./symbolWorker.js";

const prismaClient = new PrismaClient();

/*
    This class controls all the background workers.
    A worker listens to Binance for one coin and tries to match pending orders for that coin.
*/
class OrderWorkerManager {
    constructor() {
        this.activeWorkers = new Map(); // key: coinSymbol, value: worker instance
    }

    // This function is called whenever a new order is created.
    async onNewOrder(coinSymbol) {

        // If a worker already exists for this coin, no need to start another
        if (this.activeWorkers.has(coinSymbol)) {
            return;
        }

        console.log("Starting worker for " + coinSymbol);

        // Create the worker for this coin.
        // The returned object must have a stop() method.
        const workerInstance = createSymbolWorker(coinSymbol);

        // Save the worker instance so we know this coin is being watched
        this.activeWorkers.set(coinSymbol, workerInstance);
    }

    async checkIfWorkerShouldStop(coinSymbol) {

        // Count pending orders in the database
        const pendingCount = await prismaClient.order.count({
            where: {
                coinSymbol: coinSymbol,
                status: OrderStatus.PENDING
            }
        });

        // If there are no orders left, shut down the worker
        if (pendingCount === 0) {

            console.log("[ORDER-WORKER] Stopping worker for coin: " + coinSymbol);

            const workerInstance = this.activeWorkers.get(coinSymbol);

            // Stop the worker if it exists and has a stop() function
            if (workerInstance && typeof workerInstance.stop === "function") {
                workerInstance.stop();
            }

            // Remove the worker from our list
            this.activeWorkers.delete(coinSymbol);
        }
    }
}

// Export a single shared instance used everywhere in the backend
export const orderWorkerManager = new OrderWorkerManager();
