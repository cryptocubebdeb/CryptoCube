// src/app/api/custom-signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await hash(password, 10);

    // user already has password
    if (existing && existing.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This email already has a password. Go to the sign-in page and log in instead.",
        },
        { status: 400 }
      );
    }

    // user exists but OAuth-only → attach password
    if (existing && !existing.passwordHash) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: name || existing.name,
        },
      });

      return NextResponse.json({
        ok: true,
        mode: "attached-password",
        message: "Password added to existing account.",
      });
    }

    // brand new user
    await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });

    return NextResponse.json({
      ok: true,
      mode: "created",
      message: "Account created.",
    });
  } catch (err) {
    console.error("CUSTOM SIGNUP ROUTE ERROR", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
