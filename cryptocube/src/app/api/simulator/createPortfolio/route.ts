import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }

    // Get user par courriel pour avoir id
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    // Check si user a déjà un compte simulateur
    const existingSimulatorAccount = await prisma.simulatorAccount.findUnique({
        where: { userId: user.id },
    });

    if (existingSimulatorAccount) {
        return NextResponse.json(
            { error: "Simulator account already exists" },
            { status: 400 }
        );
    }

    // Créer simulator account
    const newSimulatorAccount = await prisma.simulatorAccount.create({
        data: {
            userId: user.id,
            initialCashBalance: 100000,
            currentCashBalance: 100000,
            realizedProfitUsd: 0,
        },
    });

    return NextResponse.json({ success: true, newSimulatorAccount });
}