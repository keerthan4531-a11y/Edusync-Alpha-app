import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";
import { esChat } from "@/lib/es-engine";
import { safeJsonParse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { contentId, selectedTone, correctTone } = body;

    if (!contentId || !selectedTone || !correctTone) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const isCorrect = selectedTone === correctTone;
    const score = isCorrect ? 100 : 0;
    const xpAwarded = isCorrect ? 20 : 5;

    // AI feedback using es-engine
    let feedback = isCorrect 
      ? `Superb! You correctly identified the emotional tone as ${correctTone}.` 
      : `The emotional tone was actually ${correctTone}.`;
    let tamilFeedback = isCorrect 
      ? `அருமை! நீங்கள் உணர்ச்சி தொனியைச் சரியாக ${correctTone} என்று கண்டறிந்துள்ளீர்கள்.`
      : `உணர்ச்சி தொனி உண்மையில் ${correctTone} ஆகும்.`;

    try {
      const systemPrompt = `You are a professional English tutor evaluating a voice tone exercise.
Return ONLY a valid JSON object:
{
  "feedback": "English explanation here",
  "tamil_feedback": "Tamil explanation here"
}`;
      const prompt = `Student identified the emotional tone of a speech snippet as '${selectedTone}'. It was actually '${correctTone}'.
Explain briefly in 1-2 sentences why it was '${correctTone}' and provide a Tamil translation.`;

      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      const parsedAi = safeJsonParse<{ feedback?: string; tamil_feedback?: string }>(aiResponse);
      if (parsedAi?.feedback && parsedAi?.tamil_feedback) {
        feedback = parsedAi.feedback;
        tamilFeedback = parsedAi.tamil_feedback;
      }
    } catch (err) {
      console.warn("[ES-ENGINE] evaluate-tone AI failed, using fallback:", err);
    }

    // Save to database Stage1Activity
    // @ts-ignore
    await db.stage1Activity.create({
      data: {
        userId,
        contentId,
        type: "LISTENING",
        score,
        xpAwarded,
        feedback: JSON.stringify({
          isCorrect,
          text: feedback,
          tamilText: tamilFeedback
        })
      }
    });

    if (xpAwarded > 0) {
      await awardXp(userId, xpAwarded, `Completed tone analysis challenge with score ${score}%`);
    }

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      score,
      xpAwarded,
      feedback,
      tamilFeedback
    });
  } catch (error: any) {
    console.error("Failed to evaluate voice tone:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
