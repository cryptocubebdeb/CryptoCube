import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return Response.json(
        { error: "Missing ?symbol= parameter" },
        { status: 400 }
      );
    }

    // Fetch the orderbook entry AND load the orders
    const orderBook = await prisma.orderBook.findUnique({
      where: { coinSymbol: symbol },
      include: {
        bestBuyOrder: true,
        bestSellOrder: true,
      },
    });

    if (!orderBook) {
      return Response.json(
        { error: "OrderBook not found for this symbol" },
        { status: 404 }
      );
    }

    return Response.json(orderBook, { status: 200 });
  } catch (err) {
    console.error("Error fetching orderbook:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
