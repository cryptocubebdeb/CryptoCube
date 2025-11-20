// /app/api/orders/executed/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { getAuthSession } from "@/app/lib/getServerSession";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getAuthSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const executed = await prisma.order.findMany({
            where: {
                simulatorAccount: {
                    userId: session.user.id
                },
                status: OrderStatus.EXECUTED
            },
            orderBy: {
                executedAt: "desc"
            }
        });

        return NextResponse.json({ executed });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
