import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    try {
        // Real database query
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId },
            select: { 
                id: true,
                email: true,
                nom: true,
                prenom: true,
                username: true 
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}


export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const data = await request.json();
    const { email, nom, prenom, username } = data;

    if (!email || !nom || !prenom || !username) {
        return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    try {
        // Real database query
        const updatedUser = await prisma.utilisateur.update({
            where: { id: userId },
            data: {
                email,
                nom,
                prenom,
                username
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                username: true
            }
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}