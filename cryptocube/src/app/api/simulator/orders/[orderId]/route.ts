import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthSession } from "@/app/lib/getServerSession";
import { OrderStatus } from "@prisma/client";

/*
   GET /api/simulator/orders/[orderId]
   Fetch a single order
*/
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;

        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const id = Number(orderId);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!simulatorAccount) {
            return NextResponse.json({ error: "Simulator account not found" }, { status: 404 });
        }

        const order = await prisma.order.findFirst({
            where: { id, simulatorAccountId: simulatorAccount.id },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


/*
   POST /api/simulator/orders/[orderId]
   Cancel a pending order
*/
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;

        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const id = Number(orderId);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
        }

        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id },
        });

        if (!simulatorAccount) {
            return NextResponse.json({ error: "Simulator account not found" }, { status: 404 });
        }

        const order = await prisma.order.findUnique({ where: { id } });

        if (!order || order.simulatorAccountId !== simulatorAccount.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status !== OrderStatus.PENDING) {
            return NextResponse.json(
                { error: "Only pending orders can be cancelled" },
                { status: 400 }
            );
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status: OrderStatus.CANCELLED },
        });

        return NextResponse.json({ message: "Order cancelled", order: updated });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
