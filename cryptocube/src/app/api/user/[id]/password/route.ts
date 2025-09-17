import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from 'bcryptjs';
import { use } from "react";

const useStub = process.env.USE_STUB === 'true';

const STUB_CURRENT_PASSWORD="oracle123"; // For stub only

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

    if (useStub) {
        if (currentPassword !== STUB_CURRENT_PASSWORD) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
        }
        return NextResponse.json({ message: "Password updated successfully (stub)" });
    }


    // ================== Real database query ==================
    // Fetch user's password
    const { rows } = await pool.query(
        "SELECT password FROM utilisateur WHERE id_utilisateur = $1",
        [userId]
    );
    if (!rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const hashed = rows[0].password as string;

    // Compare current password
    const match = await bcrypt.compare(currentPassword, hashed);
    if (!match) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    // Hash new password
    const newHashed = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await pool.query(
        "UPDATE utilisateur SET password = $1 WHERE id_utilisateur = $2",
        [newHashed, userId]
    );

    return NextResponse.json({ message: "Password updated successfully" });
}