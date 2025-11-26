# Crypto Simulator Worker System

## Overview
This system simulates cryptocurrency trading by processing **pending user orders** and matching them against live Binance prices. Each coin symbol has a dedicated worker that maintains an in-memory order book and executes trades atomically in the database.

---

## File Roles

### `processOrder.js`
- Executes trades in the database.
- Updates user portfolios, cash balances, realized profit, and trade history.
- Runs all updates atomically in a Prisma transaction to ensure consistency.

### `matchPendingOrders.js`
- Matches pending simulator orders against the **in-memory Binance order book**.
- Handles market and limit orders separately:
  - **Market orders:** execute immediately at the best bid/ask.
  - **Limit orders:** execute only if the market price satisfies the limit.
- Calls `processOrder.js` for atomic execution.

### `computeLocalOrderBook.js`
- Computes the highest buy and lowest sell among **local DB orders** for a coin.
- Updates the `orderBook` table for reference.
- Used to track best local user orders independently of Binance.

### `updateInMemoryBinanceBook.js`
- Maintains an **in-memory copy of Binance order books**.
- Processes incremental depth updates received via WebSocket.
- Aggregates quantities at the same price and keeps bids/asks sorted.

### `coinWorker.js`
- Creates a worker for a single coin symbol.
- Opens a WebSocket to Binance for live market updates.
- Updates the in-memory Binance order book.
- Periodically calls `matchPendingOrders.js` to execute pending orders.

### `workerManager.js`
- Tracks all active workers in the system.
- Starts a worker when a new coin has pending orders.
- Stops a worker when there are no remaining pending orders for that coin.

### `startWorkers.js`
- Backend entrypoint that initializes workers on startup.
- Finds all coins with pending orders and starts a worker for each.
- Ensures that the system begins processing immediately after backend launch.

### `logger.js`
- Handles logging of order events, execution errors, and worker activity.

---

## Algorithm Flow

### 1. Worker Startup
- `startWorkers.js` scans the database for coins with pending orders.
- Calls `workerManager.onNewOrder(coinSymbol)` to start a worker per coin.

### 2. Worker Operations (`coinWorker.js`)
- Opens a **WebSocket connection to Binance** for the coin symbol.
- Maintains an **in-memory order book** with bids and asks.
- Updates the book using incremental updates (`updateInMemoryBinanceBook.js`).
- Periodically calls `matchPendingOrders.js`.

### 3. Order Matching (`matchPendingOrders.js`)
- Runs every `matchInterval` milliseconds.
- Fetches all pending simulator orders from the database.
- For each order:
  - **Market orders:** execute immediately at top-of-book.
  - **Limit orders:** execute only if the top bid/ask satisfies the limit.
- Calls `processOrder.js` to update portfolios, cash, and trade history atomically.
- Marks orders as executed or cancelled.

### 4. Order Book Updates
- Updates **local DB orderBook** after processing using `computeLocalOrderBook.js`.
- Logs all executions and errors.

### 5. Worker Shutdown
- `workerManager.checkIfWorkerShouldStop` monitors pending orders.
- Stops the worker when there are no remaining orders for that coin.

---

## Key Concepts
- **In-memory Binance order book:** Tracks live top-of-book prices for each coin. Used for matching orders.
- **Local DB orders:** User-submitted pending orders stored in the database.
- **Atomic execution:** Ensures portfolio and account updates succeed together or fail together.
- **Worker-per-coin architecture:** Isolates processing per coin for efficiency and reliability.
