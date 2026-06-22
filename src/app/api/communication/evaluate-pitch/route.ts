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

    const { contentId, transcribedText, seconds } = await req.json();

    if (!contentId || !transcribedText) {
      return NextResponse.json({ error: "Invalid submission parameters" }, { status: 400 });
    }

    // @ts-ignore
    const content = await db.stage1Content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const systemPrompt = "You are an expert English speech and presentation coach.";
    const promptText = `You are evaluating a student's presentation topic pitch.
    Presentation Topic: "${content.content}"
    Student's Speech Transcript: "${transcribedText}"
    Duration: ${seconds || 10} seconds
    
    Evaluate their fluency, vocabulary, grammar, and pronunciation clarity. Determine WPM (words per minute) based on speech duration, detect common filler words (like "um", "uh", "like", "so", "basically", "actually"), and compute a fluency score.
    
    Return your response as a valid JSON object ONLY. Do NOT wrap in markdown.
    {
      "fluencyScore": integer (0-100),
      "wpm": integer,
      "fillerCount": integer,
      "fillersUsed": ["list of filler words used"],
      "paceFeedback": "Short feedback on speaking pace/WPM in English",
      "feedback": "Two sentences of constructive feedback on speech clarity and vocabulary in English",
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
        feature: "chat",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let parsedResponse = {
      fluencyScore: 70,
      wpm: 120,
      fillerCount: 0,
      fillersUsed: [],
      paceFeedback: "Good rhythm! Your pacing is well suited for public presentations.",
      feedback: "Good try! You covered the topic well, but try to use more cohesive conjunctions.",
      tamilFeedback: "நல்ல முயற்சி! நீங்கள் தலைப்பைச் சரியாகப் பேசினீர்கள், ஆனால் வார்த்தைகளை இணைத்துப் பேசுவதில் கவனம் செலுத்துங்கள்."
    };

    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.fluencyScore !== undefined) {
        parsedResponse = parsed;
      }
    } catch (e) {
      console.error("Failed to parse pitch evaluation response", aiRes.response);
    }

    const score = Math.max(0, Math.min(100, parsedResponse.fluencyScore));
    const xpAwarded = score >= 80 ? 25 : (score >= 50 ? 15 : 5);

    // Save activity
    // @ts-ignore
    await db.stage1Activity.create({
      data: {
        userId,
        contentId,
        type: "SPEAKING",
        score,
        xpAwarded,
        feedback: JSON.stringify(parsedResponse)
      }
    });

    if (xpAwarded > 0) {
      await awardXp(userId, xpAwarded, `Completed Pitch Analyzer challenge with score ${score}%`);
    }

    return NextResponse.json({
      success: true,
      score,
      xpAwarded,
      evaluation: parsedResponse
    });

  } catch (error: any) {
    console.error("Evaluate Pitch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
