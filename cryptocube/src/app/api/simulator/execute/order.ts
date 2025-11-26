import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { OrderKind, OrderStatus } from "@prisma/client";
import { executeTrade } from "@/app/lib/executeTrade";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // =============================
    // MARKET ORDER → execute immediately
    // =============================
    if (order.orderKind === OrderKind.MARKET) {
      const executionPrice = Number(order.price);

      await executeTrade(order, executionPrice, Number(order.amount));

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.EXECUTED,
          executedAt: new Date(),
          executedPrice: executionPrice,
        },
      });

      return NextResponse.json({ ok: true, executedOrderIds: [order.id] });
    }

    // =============================
    // LIMIT ORDER → execute at limit price (approved by Worker 5)
    // =============================
    const limitPrice = Number(order.price);

    await executeTrade(order, limitPrice, Number(order.amount));

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.EXECUTED,
        executedAt: new Date(),
        executedPrice: limitPrice,
      },
    });

    return NextResponse.json({ ok: true, executedOrderIds: [order.id] });

  } catch (err) {
    console.error("EXECUTION ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
