import { PrismaClient, OrderStatus, OrderKind } from "@prisma/client";
import { getAuthSession } from "@/app/lib/getServerSession";
import { recomputeLocalOrderBook } from "../../../../../worker/computeLocalOrderBook";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return Response.json(
        { error: "No user connected" },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.orderId);
    if (isNaN(orderId)) {
      return Response.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow canceling pending orders
    if (order.status !== OrderStatus.PENDING) {
      return Response.json(
        { error: "Only PENDING orders can be canceled" },
        { status: 400 }
      );
    }

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId },
    });

    // Recompute OrderBook
    await recomputeLocalOrderBook(order.coinSymbol);

    return Response.json(
      { ok: true, message: "Order canceled successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error cancelling order:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
