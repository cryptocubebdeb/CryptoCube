import { NextResponse } from "next/server";
import { getTopGainers } from "../../../lib/getTopGainers";

export async function GET() {
  try {
    const coins = await getTopGainers();
    return NextResponse.json({ coins });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch top gainers" },
      { status: 500 }
    );
  }
}
