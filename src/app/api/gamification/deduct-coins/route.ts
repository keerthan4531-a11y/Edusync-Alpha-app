import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deductCoins } from "@/lib/gamification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, reason } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    try {
      const user = await deductCoins(session.user.id, amount, reason || "Deducted coins");
      return NextResponse.json({ success: true, coins: user.coins });
    } catch (e: any) {
      if (e.message === "Not enough coins") {
        return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Failed to deduct coins:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
