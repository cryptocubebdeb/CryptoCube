import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthSession } from "@/app/lib/getServerSession";
import { OrderKind, TradeType, OrderStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

//Get route to get all orders for the authenticated user
export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!simulatorAccount) {
            return NextResponse.json(
                { error: "Simulator account not found" },
                { status: 404 }
            );
        }

        const orders = await prisma.order.findMany({
            where: { simulatorAccountId: simulatorAccount.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Post /simulator/orders : route to create a new order for the authenticated user
export async function POST(request: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!simulatorAccount) {
            return NextResponse.json(
                { error: "Simulator account not found" },
                { status: 404 }
            );
        }

        const body = await request.json().catch(() => null);

        const { coinId, coinSymbol, amount, orderKind, orderType, price } = body || {};
        if (!coinId || !coinSymbol || !amount || !orderKind || !orderType) {
            return NextResponse.json(
                { error: "coinId, coinSymbol, amount, orderKind, orderType are required." },
                { status: 400 }
            );
        }

        if (amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be greater than zero." },
                { status: 400 }
            );
        }

        if (!["BUY", "SELL"].includes(orderType.toUpperCase())) {
            return NextResponse.json({ error: "Invalid orderType. Must be BUY or SELL." }, { status: 400 });
        }

        if (!["market", "limit", "MARKET", "LIMIT"].includes(orderKind)) {
            return NextResponse.json({ error: "Invalid orderKind. Must be MARKET or LIMIT." }, { status: 400 });
        }

        const normalizedOrderKind = orderKind.toUpperCase() === "MARKET" ? OrderKind.MARKET : OrderKind.LIMIT;

        let finalPrice = null;
        if (normalizedOrderKind === OrderKind.LIMIT) {
            if (!price || price <= 0) {
                return NextResponse.json(
                    { error: "Price must be provided and greater than zero for LIMIT orders." },
                    { status: 400 }
                );
            }

            // convert price to string to match prisma decimal type
            finalPrice = price.toString();
        }

        const newOrder = await prisma.order.create({
            data: {
                simulatorAccountId: simulatorAccount.id,
                coinId: coinId,              // <-- THIS MUST EXIST
                coinSymbol: coinSymbol,      // ex: BTC
                orderType: orderType.toUpperCase() === "BUY" ? TradeType.BUY : TradeType.SELL,
                orderKind: normalizedOrderKind,
                amount: amount.toString(),
                price: finalPrice,
                status: OrderStatus.PENDING
            }
        });

        return NextResponse.json({ order: newOrder }, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}