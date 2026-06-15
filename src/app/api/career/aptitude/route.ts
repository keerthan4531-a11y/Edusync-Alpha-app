import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { testId, score, maxScore } = body;

    if (!testId || typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json({ error: "Missing test results" }, { status: 400 });
    }

    const percentage = Math.round((score / maxScore) * 100);
    const xpAwarded = Math.round(percentage * 0.5); // Example: 50 XP max

    // Save activity
    await db.stage4Activity.create({
      data: {
        userId: session.user.id,
        type: "APTITUDE",
        score: percentage,
        xpAwarded,
        testId,
        feedback: JSON.stringify({ rawScore: score, maxScore })
      }
    });

    if (xpAwarded > 0) {
      await awardXp(session.user.id, xpAwarded, "Aptitude Test Completion");
    }

    // Update Stage Progress if completed (e.g. >= 60%)
    if (percentage >= 60) {
      const stage = await db.stage.findFirst({ where: { number: 4 } });
      if (stage) {
        await db.stageProgress.upsert({
          where: {
            userId_stageId: {
              userId: session.user.id,
              stageId: stage.id
            }
          },
          update: {
            status: "COMPLETED",
            completedAt: new Date()
          },
          create: {
            userId: session.user.id,
            stageId: stage.id,
            status: "COMPLETED",
            completedAt: new Date()
          }
        });
      }
    }

    return NextResponse.json({ success: true, score: percentage, xpAwarded });
  } catch (error: any) {
    console.error("Aptitude submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
