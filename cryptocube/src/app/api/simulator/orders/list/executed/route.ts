import { NextResponse } from "next/server"; 
import { prisma } from "@/app/lib/prisma";
import { getAuthSession } from "@/app/lib/getServerSession";
import { OrderStatus } from "@prisma/client";   

// /simulator/orders/executed : route to get all executed orders for the authenticated user
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
        const executedOrders = await prisma.order.findMany({        
            where: {
                simulatorAccountId: simulatorAccount.id,
                status: OrderStatus.EXECUTED,   
            },
            orderBy: { createdAt: "desc" }, //sorted by most recent
        });
        return NextResponse.json({ orders: executedOrders });
    } catch (error) {
        console.error("Error fetching executed orders:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}