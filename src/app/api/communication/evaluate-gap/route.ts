import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";
import { esChat } from "@/lib/es-engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { contentId, userAnswers, correctAnswers } = body;

    if (!contentId || !Array.isArray(userAnswers) || !Array.isArray(correctAnswers)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    let correctCount = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
      const u = (userAnswers[i] || "").trim().toLowerCase();
      const c = (correctAnswers[i] || "").trim().toLowerCase();
      if (u === c || c.includes(u) || u.includes(c)) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / correctAnswers.length) * 100);
    const xpAwarded = score === 100 ? 25 : score === 50 ? 15 : 5;

    // AI feedback using es-engine
    let feedback = score === 100
      ? "Perfect! You accurately filled all details from the audio clip."
      : "Some details were missed. Try playing the audio once more and check the script details.";
    let tamilFeedback = score === 100
      ? "அருமை! நீங்கள் ஆடியோவிலிருந்து அனைத்து விவரங்களையும் சரியாக நிரப்பியுள்ளீர்கள்."
      : "சில விவரங்கள் விடுபட்டுள்ளன. ஆடியோவை மீண்டும் ஒருமுறை கேட்டு முயற்சிக்கவும்.";

    try {
      const systemPrompt = "You are a professional English tutor.";
      const prompt = `Student filled gaps in a listening transcription task.
      Correct answers: ${JSON.stringify(correctAnswers)}
      Student answers: ${JSON.stringify(userAnswers)}
      Accuracy: ${score}%.
      Provide encouraging feedback in English (1-2 sentences) and a Tamil translation.
      Return ONLY a valid JSON object:
      {
        "feedback": "English feedback here",
        "tamil_feedback": "Tamil translation/feedback here"
      }`;

      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedAi = JSON.parse(jsonMatch[0]);
        if (parsedAi.feedback && parsedAi.tamil_feedback) {
          feedback = parsedAi.feedback;
          tamilFeedback = parsedAi.tamil_feedback;
        }
      }
    } catch (err) {
      console.warn("[ES-ENGINE] evaluate-gap AI failed, using fallback:", err);
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
          isCorrect: score === 100,
          text: feedback,
          tamilText: tamilFeedback
        })
      }
    });

    if (xpAwarded > 0) {
      await awardXp(userId, xpAwarded, `Completed listening gap fill challenge with score ${score}%`);
    }

    return NextResponse.json({
      success: true,
      score,
      xpAwarded,
      feedback,
      tamilFeedback
    });
  } catch (error: any) {
    console.error("Failed to evaluate gap fill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
