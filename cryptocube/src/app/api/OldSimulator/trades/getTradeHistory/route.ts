import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/app/lib/getServerSession";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id)
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const account = await prisma.simulatorAccount.findUnique({
            where: { userId: session.user.id }
        });

        if (!account)
            return NextResponse.json({ trades: [] });

        const trades = await prisma.tradeHistory.findMany({
            where: { simulatorAccountId: account.id },
            orderBy: { id: "desc" }
        });

        return NextResponse.json({ trades });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
