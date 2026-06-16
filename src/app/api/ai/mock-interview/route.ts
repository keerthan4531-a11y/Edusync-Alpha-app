import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, transcript, sessionId } = body;

    if (action === "evaluate_final") {
      const systemPrompt = `You are an expert HR interviewer. Evaluate the candidate's job interview response/transcript: "${transcript}".
You MUST return ONLY a raw JSON block containing candidate scores and feedback. Do not write any other text. Follow this schema:
{
  "score": <number between 50 and 100>,
  "feedback": "A concise summary of performance",
  "strengths": ["list of 2 strengths"],
  "areasForImprovement": ["list of 2 improvements"]
}`;

      const messages: INIXAMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please evaluate this interview session.` }
      ];

      const aiRes = await generateResponse(
        messages,
        {
          stage: "stage-4",
          feature: "mock-interview",
          role: session.user.role || "STUDENT",
          userId: session.user.id
        }
      );

      let evaluation = {
        score: 75,
        feedback: "Good response. Focus on structured answers.",
        strengths: ["Communication skills", "Honesty"],
        areasForImprovement: ["Add metrics", "Structure better"]
      };

      try {
        const parsed = JSON.parse(aiRes.response.trim());
        if (parsed && typeof parsed.score === 'number') {
          evaluation = parsed;
        }
      } catch (e) {
        // Fallback if AI outputted markdown wrap or invalid json
        const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
        try {
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed.score === 'number') {
            evaluation = parsed;
          }
        } catch {}
      }

      const xpAwarded = Math.round(evaluation.score);
      
      await db.stage4Activity.create({
        data: {
          userId: session.user.id,
          type: "MOCK_INTERVIEW",
          score: evaluation.score,
          xpAwarded,
          feedback: JSON.stringify({
            strengths: evaluation.strengths,
            areasForImprovement: evaluation.areasForImprovement
          })
        }
      });

      await awardXp(session.user.id, xpAwarded, "Mock Interview Completion");

      return NextResponse.json({
        evaluation,
        xpAwarded
      });
    }

    // Default: generating the next follow-up question
    const systemPrompt = `You are a helpful and professional job interviewer. Ask a single direct follow-up question based on the candidate's previous response: "${transcript}". Keep the tone professional, direct, and under 2 sentences.`;
    
    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate the next interview question.` }
    ];

    const aiRes = await generateResponse(
      messages,
      {
        stage: "stage-4",
        feature: "mock-interview",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    return NextResponse.json({
      nextQuestion: aiRes.response || "Could you explain a time when you had to resolve a complex bug under a tight deadline?",
      feedback: "Answer received. Generating follow-up..."
    });

  } catch (error: any) {
    console.error("Mock interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
