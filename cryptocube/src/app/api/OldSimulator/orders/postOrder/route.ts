import { getAuthSession } from "@/app/lib/getServerSession";
import { PrismaClient } from "@prisma/client";
import { getCoin } from "@/app/lib/getCoin";
import { recomputeLocalOrderBook } from "../../../../../../worker/computeLocalOrderBook";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return Response.json({ error: "No user connected" }, { status: 401 });
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!simulatorAccount) {
            return Response.json({ error: "Simulator account not found." }, { status: 404 });
        }

        const body = await req.json().catch(() => null);

        const { coinId, tradeSymbol, quantity, orderKind, orderSell, price } = body || {};

        if (!coinId || !tradeSymbol || !quantity || !orderSell || !orderKind) {
            return Response.json(
                { error: "coinId, tradeSymbol, quantity, orderKind, orderSell are required." },
                { status: 400 }
            );
        }

        if (quantity <= 0) {
            return Response.json({ error: "Quantity must be greater than zero." }, { status: 400 });
        }

        const coinData = await getCoin(coinId);
        if (!coinData) {
            return Response.json({ error: "Coin not found." }, { status: 404 });
        }

        const finalPrice = orderKind === "market"
            ? coinData.market_data.current_price.cad
            : price;

        const newOrder = await prisma.order.create({
            data: {
                simulatorAccountId: simulatorAccount.id,
                coinSymbol: tradeSymbol,
                coinId: coinId, 
                orderType: orderSell.toUpperCase(),
                orderKind: orderKind.toUpperCase(),
                amount: quantity,
                price: finalPrice,
                status: "PENDING",
            },
        });

        if (orderKind.toLowerCase() === "limit") {
            await recomputeLocalOrderBook(tradeSymbol);
        }

        return Response.json({ ok: true, order: newOrder }, { status: 201 });

    } catch (error) {
        console.error("Error while creating order:", error);
        return Response.json({ error: "Internal server error." }, { status: 500 });
    }
}
