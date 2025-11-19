import { getAuthSession } from "@/app/lib/getServerSession";
import { PrismaClient } from '@prisma/client';
import { getCoin } from '../../../lib/getCoin';
import { recomputeOrderBook } from "../../../../../worker/orderBook";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            //probably add a redirect session here later (or a please login message) 
            return Response.json(
                { error: "No user connected" },
                { status: 401 }
            );
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!simulatorAccount) {
            return Response.json(
                { error: "Simulator account not found." },
                { status: 404 }
            );
        }

        const body = await req.json().catch(() => null);

        if (!body || typeof body !== "object") {

            return Response.json(
                { error: "Invalid request body." },
                { status: 400 }
            );
        }

        const { symbol, quantity, orderKind, orderSell, price } = body as {
            symbol?: string;
            quantity?: number;
            orderKind?: "market" | "limit";
            orderSell?: "buy" | "sell";
            price?: number;
        };

        if (!symbol || !quantity || !orderKind || !orderSell) {
            return Response.json(
                { error: "Symbol, quantity, orderKind and orderSell are required fields." },
                { status: 400 }
            );
        }

        if (quantity <= 0) {
            return Response.json(
                { error: "Quantity must be greater than zero." },
                { status: 400 }
            );
        }

        // A price is only required for limit orders. 
        // Market order just sell at the current price. So price is determined at execution time.
        if (orderKind === "limit" && (price === undefined || price <= 0)) {
            return Response.json(
                { error: "Limit orders require a valid price greater than 0." },
                { status: 400 }
            );
        }

        // --- Fetch data ---
        const [coinData] = await getCoin(symbol);
        if (!coinData) {
            return Response.json(
                { error: "Coin not found." },
                { status: 404 }
            );
        }

        let finalPrice: number | undefined = undefined;

        if (orderKind === "market") {
            finalPrice = coinData?.market_data?.current_price?.cad; //We fetch the price at the exact price. Might need to check a system with actual available orders 
        } else if (orderKind === "limit") {
            finalPrice = price;
        }

        // --- Create order ---
        const newOrder = await prisma.order.create({
            data: {
                simulatorAccountId: simulatorAccount.id,
                coinSymbol: symbol,
                orderType: orderSell.toUpperCase() as "BUY" | "SELL",
                orderKind: orderKind.toUpperCase() as "MARKET" | "LIMIT",
                amount: quantity,             
                price: finalPrice ?? null,  //market orders can be null technically (when just created)
                status: "PENDING",
            },
        });

        //Recompute order book if limit order
        if (orderKind.toLowerCase() === "limit") {
            await recomputeOrderBook(symbol);
        }

        return Response.json({ ok: true, order: newOrder }, { status: 201 });

    } catch (error) {
        console.error("Error while creating order:", error);
        return Response.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}