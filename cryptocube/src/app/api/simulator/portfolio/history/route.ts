import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthSession } from "@/app/lib/getServerSession";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

  // Get the user simulator account
  const sim = await prisma.simulatorAccount.findUnique({
    where: { userId: session.user.id },
  });

  if (!sim) {
    return NextResponse.json({ error: "No simulator account" }, { status: 404 });
  }

  // Fetch history
  const history = await prisma.portfolioHistory.findMany({
    where: { simulatorAccountId: sim.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(history);
}
