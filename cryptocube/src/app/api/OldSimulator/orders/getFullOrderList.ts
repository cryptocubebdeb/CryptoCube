import { getAuthSession } from "@/app/lib/getServerSession";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return Response.json(
                { error: "No user connected" },
                { status: 401 }
            );
        }
        const simulatorAccount = await prisma.simulatorAccount.findUnique({
            where: {
                userId: session.user.id,
            },
            include: { orders: true },
        });

        if (!simulatorAccount) {
            return Response.json(
                { error: "Simulator account not found." },
                { status: 404 }
            );
        }
        const orders = simulatorAccount.orders || [];
        return Response.json({ orders });
        
    } catch (error) {
        console.error("Error in GET /simulator/orders:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}