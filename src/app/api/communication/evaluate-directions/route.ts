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
    const { contentId, path } = body; // path is array of {row, col}

    if (!contentId || !Array.isArray(path)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const content = await db.stage1Content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Content challenge not found" }, { status: 404 });
    }

    let isCorrect = false;
    let correctPath: any[] = [];
    let startName = "Start";
    let endName = "Destination";
    try {
      const parsed = JSON.parse(content.questions || "{}");
      correctPath = parsed.correctPath || [];
      startName = parsed.start?.name || "Start";
      endName = parsed.end?.name || "Destination";
    } catch (e) {
      console.error("Failed to parse direction challenge correctPath", e);
    }

    // Compare paths
    if (path.length === correctPath.length) {
      isCorrect = path.every((point: any, idx: number) => {
        const correctPoint = correctPath[idx];
        return point.row === correctPoint.row && point.col === correctPoint.col;
      });
    }

    const score = isCorrect ? 100 : 0;
    const xpAwarded = isCorrect ? 25 : 5;

    // AI feedback generation using es-engine fallback chain
    let feedback = isCorrect 
      ? "Perfect direction tracing! You navigated correctly." 
      : "The traced path did not match the instructions. Keep trying!";
    let tamilFeedback = isCorrect 
      ? "அருமையான வரைபட வழிகாட்டுதல்! நீங்கள் சரியாகப் பயணித்தீர்கள்." 
      : "வரைந்த வழி அறிவுறுத்தல்களுடன் பொருந்தவில்லை. மீண்டும் முயற்சிக்கவும்!";

    try {
      const systemPrompt = "You are a professional English tutor.";
      const prompt = `Student traced a path on a map from '${startName}' to '${endName}'.
      Path correctness: ${isCorrect ? "Correct" : "Incorrect"}, Score: ${score}%.
      Give feedback in 1-2 sentences and a Tamil translation.
      Return ONLY a valid JSON object:
      {
        "feedback": "English feedback here",
        "tamil_feedback": "Tamil feedback here"
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
      console.warn("[ES-ENGINE] evaluate-directions AI failed, using fallback:", err);
    }

    // Record Stage1Activity log
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
      await awardXp(userId, xpAwarded, `Completed listening direction follower challenge with score ${score}%`);
    }

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      xpAwarded,
      feedback,
      tamilFeedback
    });
  } catch (error: any) {
    console.error("Failed to evaluate grid directions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
