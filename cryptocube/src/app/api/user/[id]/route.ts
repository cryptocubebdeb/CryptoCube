import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

const useStub = process.env.USE_STUB === 'true';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (useStub) {
        // Fake user for Page Profil
        return NextResponse.json({
            id_utilisateur: userId,
            email: "johndoe222@gmail.com",
            nom: "Doe",
            prenom: "John",
            username: "johndoe222"
        });
    }

    // Real database query
    const { rows } = await pool.query(
        "SELECT id_utilisateur, email, nom, prenom, username FROM utilisateur WHERE id_utilisateur = $1",
        [userId]
    );

    if (!rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
}


export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const data = await request.json();
    const { email, nom, prenom, username } = data;

    if (!email || !nom || !prenom || !username) {
        return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    if (useStub) {
        // Fake user for Page Profil
        return NextResponse.json({
            id_utilisateur: userId,
            email,
            nom,
            prenom,
            username
        });
    }

    // Real database query
    const { rows } = await pool.query(
        "UPDATE utilisateur SET email = $1, nom = $2, prenom = $3, username = $4 WHERE id_utilisateur = $5 RETURNING id_utilisateur, email, nom, prenom, username",
        [email, nom, prenom, username, userId]
    );

    if (!rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
}