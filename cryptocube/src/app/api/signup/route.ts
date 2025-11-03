// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    const prenom = String(body.prenom ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    // basic validation
    if (!email || !password || !nom || !prenom) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    // unique email check
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (match your schema: email String? if you allow OAuth without email)
    const user = await prisma.user.create({
      data: {
        email,                 // ensure your Prisma model has email (nullable if Reddit)
        name: nom,             // you used user.name earlier
        prenom,                // you used user.prenom earlier
        passwordHash,          // credentials users only
        // If your schema has username, add: username: String(body.username ?? "").trim()
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// (optional) reject other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
