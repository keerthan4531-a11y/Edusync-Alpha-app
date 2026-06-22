import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { contentId, userRewrite } = await req.json();

    if (!contentId || !userRewrite || userRewrite.trim().length < 5) {
      return NextResponse.json({ error: "Invalid submission parameters" }, { status: 400 });
    }

    // @ts-ignore
    const content = await db.stage1Content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let bannedWords: string[] = [];
    try {
      const qData = JSON.parse(content.questions || "{}");
      bannedWords = qData.banned || [];
    } catch (e) {
      console.error("Failed to parse banned words", e);
    }

    const systemPrompt = "You are an expert English language tutor.";
    const promptText = `You are evaluating a student's rewriting challenge.
    Original Simple Sentence: "${content.content}"
    Banned Words: ${bannedWords.join(", ")}
    Student's Rewrite: "${userRewrite}"
    
    Evaluate the rewrite:
    1. Confirm that NONE of the banned words are present in the rewrite. If any banned words are used, the score should be at most 20%.
    2. Check if the rewritten sentence is grammatically correct and of high quality.
    3. Ensure it expresses the same core meaning as the original sentence.
    
    Return your response as a valid JSON object ONLY. Do NOT wrap it in markdown.
    {
      "score": integer (0-100),
      "feedback": "Two sentences of constructive feedback in English",
      "tamilFeedback": "Same feedback explained in Tamil"
    }`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: promptText }
    ];

    const aiRes = await generateResponse(
      messages,
      {
        stage: "stage-1",
        feature: "writing-grade",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let parsedResponse = {
      score: 50,
      feedback: "Good try! Keep working on your rewrite.",
      tamilFeedback: "நல்ல முயற்சி! உங்கள் வாக்கிய அமைப்பை தொடர்ந்து பயிற்சி செய்யுங்கள்."
    };

    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.score !== undefined) {
        parsedResponse = parsed;
      }
    } catch (e) {
      console.error("Failed to parse rewrite evaluation response", aiRes.response);
    }

    const score = Math.max(0, Math.min(100, parsedResponse.score));
    const xpAwarded = score >= 80 ? 20 : (score >= 50 ? 10 : 5);

    // Save activity
    // @ts-ignore
    await db.stage1Activity.create({
      data: {
        userId,
        contentId,
        type: "WRITING",
        score,
        xpAwarded,
        feedback: JSON.stringify(parsedResponse)
      }
    });

    if (xpAwarded > 0) {
      await awardXp(userId, xpAwarded, `Completed No-Filter Rewrite challenge with score ${score}%`);
    }

    return NextResponse.json({
      success: true,
      score,
      xpAwarded,
      feedback: parsedResponse.feedback,
      tamilFeedback: parsedResponse.tamilFeedback
    });

  } catch (error: any) {
    console.error("Evaluate Rewrite Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
