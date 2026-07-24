import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat, ESMessage } from "@/lib/es-engine";

// Get today's date as "YYYY-MM-DD"
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

// GET: Fetch today's daily challenge status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const today = getTodayStr();

    // Get user's current stage
    const stageProgress = await db.stageProgress.findFirst({
      where: { userId, status: { in: ["UNLOCKED", "IN_PROGRESS"] } },
      include: { stage: true },
      orderBy: { stage: { number: "asc" } },
    });
    const currentStage = stageProgress?.stage?.number || 1;

    // Find or create today's challenge set
    let challengeSet = await db.dailyChallengeSet.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!challengeSet) {
      challengeSet = await db.dailyChallengeSet.create({
        data: {
          userId,
          date: today,
          stage: currentStage,
        },
      });
    }

    return NextResponse.json({
      date: today,
      stage: currentStage,
      easy: { done: challengeSet.easyDone, score: challengeSet.easyScore, timeSec: challengeSet.easyTime },
      medium: { done: challengeSet.mediumDone, score: challengeSet.mediumScore, timeSec: challengeSet.mediumTime },
      hard: { done: challengeSet.hardDone, score: challengeSet.hardScore, timeSec: challengeSet.hardTime },
      xpAwarded: challengeSet.xpAwarded,
      allComplete: challengeSet.easyDone && challengeSet.mediumDone && challengeSet.hardDone,
      completedAt: challengeSet.completedAt,
    });
  } catch (error) {
    console.error("Daily challenges GET error:", error);
    return NextResponse.json({ error: "Failed to fetch daily challenges" }, { status: 500 });
  }
}

// POST: Mark a difficulty as complete and award XP if all done
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const today = getTodayStr();

    const body = await req.json();
    const { difficulty, score, timeSec } = body;

    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    // Find today's set
    let challengeSet = await db.dailyChallengeSet.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!challengeSet) {
      return NextResponse.json({ error: "No challenge set found for today" }, { status: 404 });
    }

    // Check if already done
    const doneField = difficulty === "EASY" ? "easyDone" : difficulty === "MEDIUM" ? "mediumDone" : "hardDone";
    if (challengeSet[doneField as keyof typeof challengeSet]) {
      return NextResponse.json({ 
        message: "Already completed",
        alreadyDone: true,
        xpAwarded: challengeSet.xpAwarded,
        allComplete: challengeSet.easyDone && challengeSet.mediumDone && challengeSet.hardDone,
      });
    }

    // Update the difficulty as done
    const updateData: Record<string, boolean | number> = {};
    if (difficulty === "EASY") {
      updateData.easyDone = true;
      updateData.easyScore = score || 100;
      updateData.easyTime = timeSec || 60;
    } else if (difficulty === "MEDIUM") {
      updateData.mediumDone = true;
      updateData.mediumScore = score || 100;
      updateData.mediumTime = timeSec || 120;
    } else {
      updateData.hardDone = true;
      updateData.hardScore = score || 100;
      updateData.hardTime = timeSec || 180;
    }

    const updated = await db.dailyChallengeSet.update({
      where: { userId_date: { userId, date: today } },
      data: updateData,
    });

    const allDone = updated.easyDone && updated.mediumDone && updated.hardDone;
    let xpAwarded = 0;

    if (allDone && updated.xpAwarded === 0) {
      // All 3 done — use AI to calculate XP (50-100 range)
      try {
        const avgScore = Math.round((updated.easyScore + updated.mediumScore + updated.hardScore) / 3);
        const avgTime = Math.round((updated.easyTime + updated.mediumTime + updated.hardTime) / 3);
        
        const messages: ESMessage[] = [
          {
            role: "system",
            content: "You are an educational performance evaluator. Return ONLY a single integer between 50 and 100 representing the XP to award. No explanation, no text, just the number."
          },
          {
            role: "user",
            content: `Student completed today's 3 daily challenges. 
Easy: score=${updated.easyScore}%, time=${updated.easyTime}s
Medium: score=${updated.mediumScore}%, time=${updated.mediumTime}s  
Hard: score=${updated.hardScore}%, time=${updated.hardTime}s
Average score: ${avgScore}%, Average time: ${avgTime}s

Based on performance (higher scores + faster time = more XP), award between 50 and 100 XP. Reply with only the number.`
          }
        ];

        const aiResponse = await esChat(messages);
        const parsed = parseInt(aiResponse.trim());
        xpAwarded = isNaN(parsed) ? 75 : Math.max(50, Math.min(100, parsed));
      } catch {
        // Fallback: base 75 XP
        xpAwarded = 75;
      }

      // Award XP and update streak
      await db.dailyChallengeSet.update({
        where: { userId_date: { userId, date: today } },
        data: { xpAwarded, completedAt: new Date() },
      });

      await db.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpAwarded },
          currentStreak: { increment: 1 },
        },
      });
    }

    const finalSet = await db.dailyChallengeSet.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return NextResponse.json({
      success: true,
      difficulty,
      allComplete: allDone,
      xpAwarded: allDone ? (xpAwarded || finalSet?.xpAwarded || 0) : 0,
      easy: { done: finalSet?.easyDone, score: finalSet?.easyScore },
      medium: { done: finalSet?.mediumDone, score: finalSet?.mediumScore },
      hard: { done: finalSet?.hardDone, score: finalSet?.hardScore },
    });
  } catch (error) {
    console.error("Daily challenges POST error:", error);
    return NextResponse.json({ error: "Failed to update daily challenge" }, { status: 500 });
  }
}
