import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const POINTS_MAP = {
  EASY: 10,
  MEDIUM: 30,
  HARD: 50,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { difficulty, moduleType } = body;

    if (!difficulty || !POINTS_MAP[difficulty as keyof typeof POINTS_MAP]) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    const points = POINTS_MAP[difficulty as keyof typeof POINTS_MAP];

    // Award points (stored in coins field)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        coins: { increment: points },
      },
      select: { coins: true, xp: true },
    });

    // Log the activity
    await db.stage1Activity.create({
      data: {
        userId,
        type: moduleType || "CHALLENGE",
        score: points,
        xpAwarded: 0, // XP is handled by daily challenges separately
        feedback: JSON.stringify({ difficulty, pointsAwarded: points }),
      },
    });

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      totalPoints: updatedUser.coins,
      totalXP: updatedUser.xp,
    });
  } catch (error) {
    console.error("Award points error:", error);
    return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
  }
}
