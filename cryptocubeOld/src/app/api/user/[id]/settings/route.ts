import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type UpdateUserBody = {
  email: string;
  name: string;
  prenom: string;
  username: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        prenom: true,
        username: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = (await request.json()) as Partial<UpdateUserBody>;
  const { email, name: fullName, prenom, username } = body;

  if (!email || !fullName || !prenom || !username) {
    return NextResponse.json({ error: "Missing user data" }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name: fullName,
        prenom,
        username,
      },
      select: {
        id: true,
        email: true,
        name: true,
        prenom: true,
        username: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
