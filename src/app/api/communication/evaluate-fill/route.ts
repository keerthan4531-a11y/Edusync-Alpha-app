import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponseTurbo, type INIXAMessage } from "@/lib/inixa-ai";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { contentId, answers } = await req.json();

    if (!contentId || !answers) {
      return NextResponse.json({ error: "Invalid submission parameters" }, { status: 400 });
    }

    // @ts-ignore
    const content = await db.stage1Content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const systemPrompt = "You are an expert English language tutor.";
    const promptText = `You are evaluating a student's listening gap fill answers.
    Monologue Transcript: "${content.content}"
    Questions and Reference Answers: ${content.questions}
    Student's Typed Answers: ${JSON.stringify(answers)}
    
    Evaluate if the student's answers match the correct details from the transcript (casing, minor spelling issues, or close synonyms are acceptable).
    
    Return your response as a valid JSON object ONLY. Do NOT wrap it in markdown.
    {
      "score": integer (0-100),
      "feedback": "Two sentences of constructive feedback in English",
      "tamilFeedback": "Same feedback explained in Tamil",
      "q1Correct": boolean,
      "q2Correct": boolean
    }`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: promptText }
    ];

    const aiRes = await generateResponseTurbo(
      messages,
      {
        stage: "stage-1",
        feature: "chat",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let parsedResponse = {
      score: 50,
      feedback: "Good try! Some details were matched.",
      tamilFeedback: "நல்ல முயற்சி! சில விவரங்கள் சரியாகப் பொருந்துகின்றன.",
      q1Correct: false,
      q2Correct: false
    };

    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.score !== undefined) {
        parsedResponse = parsed;
      }
    } catch (e) {
      console.error("Failed to parse gap fill evaluation response", aiRes.response);
    }

    const score = Math.max(0, Math.min(100, parsedResponse.score));
    const xpAwarded = score >= 80 ? 25 : (score >= 50 ? 15 : 5);

    // Save activity
    // @ts-ignore
    await db.stage1Activity.create({
      data: {
        userId,
        contentId,
        type: "LISTENING",
        score,
        xpAwarded,
        feedback: JSON.stringify(parsedResponse)
      }
    });

    if (xpAwarded > 0) {
      await awardXp(userId, xpAwarded, `Completed Fill the Beats challenge with score ${score}%`);
    }

    return NextResponse.json({
      success: true,
      score,
      xpAwarded,
      q1Correct: parsedResponse.q1Correct,
      q2Correct: parsedResponse.q2Correct,
      feedback: parsedResponse.feedback,
      tamilFeedback: parsedResponse.tamilFeedback
    });

  } catch (error: any) {
    console.error("Evaluate Gap Fill Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
