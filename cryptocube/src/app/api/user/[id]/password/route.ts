import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const userId = Number(id);
    
    if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Missing password data" }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    try {
        // Fetch user's password
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId },
            select: { motDePasse: true }
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Compare current password
        const match = await bcrypt.compare(currentPassword, user.motDePasse);
        if (!match) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
        }

        // Hash new password
        const newHashed = await bcrypt.hash(newPassword, 12);

        // Update password in database
        await prisma.utilisateur.update({
            where: { id: userId },
            data: { motDePasse: newHashed }
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}