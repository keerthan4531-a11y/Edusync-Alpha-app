import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch activities for today
    const activities = await db.stage1Activity.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart },
        type: { in: ["VOCAB_MEANING", "VOCAB_FILL"] }
      }
    });

    const meaningCompleted = activities.some((act) => act.type === "VOCAB_MEANING");
    const fillCompleted = activities.some((act) => act.type === "VOCAB_FILL");
    const completed = meaningCompleted && fillCompleted;

    return NextResponse.json({
      success: true,
      date: new Date().toISOString().split("T")[0],
      meaning_completed: meaningCompleted,
      fill_completed: fillCompleted,
      completed,
      activities
    });
  } catch (error: any) {
    console.error("Failed to fetch vocabulary challenge status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { quizType, score } = body; // quizType is 'meaning' or 'fill'

    if (!quizType || !["meaning", "fill"].includes(quizType)) {
      return NextResponse.json({ error: "Invalid quizType. Must be 'meaning' or 'fill'." }, { status: 400 });
    }

    const activityType = quizType === "meaning" ? "VOCAB_MEANING" : "VOCAB_FILL";

    // Award individual XP for completing the quiz
    // Let's say 25 XP for the individual quiz
    const individualXp = 25;

    // Create the activity log
    await db.stage1Activity.create({
      data: {
        userId,
        type: activityType,
        score,
        xpAwarded: individualXp,
        feedback: JSON.stringify({
          text: `Completed vocabulary ${quizType} quiz with ${score}% score.`,
          tamilText: `சொல்லகராதி ${quizType === "meaning" ? "பொருள்" : "நிரப்புக"} தேர்வை ${score}% மதிப்பெண்ணுடன் முடித்துள்ளார்.`
        })
      }
    });

    await awardXp(userId, individualXp, `Completed daily vocabulary ${quizType} quiz`);

    // Check if both quizzes are completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activities = await db.stage1Activity.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart },
        type: { in: ["VOCAB_MEANING", "VOCAB_FILL"] }
      }
    });

    const meaningCompleted = activities.some((act) => act.type === "VOCAB_MEANING");
    const fillCompleted = activities.some((act) => act.type === "VOCAB_FILL");
    const bothComplete = meaningCompleted && fillCompleted;

    // Streak update logic
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true }
    });

    if (user && bothComplete) {
      // Award extra bonus for completing the entire daily vocabulary challenge: 50 XP
      // Total daily challenge bonus (50 XP which awards 5 coins)
      const bonusXp = 50;
      await awardXp(userId, bonusXp, `Daily vocabulary challenge completion bonus`);

      // Streak check
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Check if user did anything yesterday
      const yesterdayActivity = await db.stage1Activity.findFirst({
        where: {
          userId,
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd
          }
        }
      });

      let newStreak = user.currentStreak;
      if (yesterdayActivity) {
        newStreak = user.currentStreak + 1;
      } else {
        // If they did something today but not yesterday, and streak is 0, make it 1
        if (newStreak === 0) newStreak = 1;
      }

      const newLongestStreak = Math.max(newStreak, user.longestStreak);

      await db.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak
        }
      });
    }

    return NextResponse.json({
      success: true,
      recorded: true,
      both_complete: bothComplete
    });
  } catch (error: any) {
    console.error("Failed to record vocabulary progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
