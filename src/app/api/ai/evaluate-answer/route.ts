import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionText, options, userAnswerIndex, correctAnswerIndex } = await req.json();

    const isCorrect = userAnswerIndex === correctAnswerIndex;
    const userAnswerText = userAnswerIndex !== -1 && options ? options[userAnswerIndex] : "No answer";
    const correctAnswerText = options ? options[correctAnswerIndex] : "Unknown";

    const systemPrompt = `You are a helpful AI tutor for software engineering candidates. 
The candidate was asked this aptitude question: "${questionText}"
The correct answer is: "${correctAnswerText}".
The candidate answered: "${userAnswerText}" (which is ${isCorrect ? "Correct" : "Incorrect"}).

Provide short, encouraging advice (under 3 sentences) explaining why the correct answer is right and how to approach similar problems.
You MUST return ONLY a valid JSON object. Do not wrap it in markdown.
Schema:
{
  "advice": "Your explanation and advice here",
  "isCorrect": boolean
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Evaluate my answer." }
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

    let evaluation = { advice: "Good effort!", isCorrect };
    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.advice) evaluation = parsed;
    } catch (e) {
      // Fallback
      evaluation = { advice: `The correct answer was ${correctAnswerText}. Keep practicing!`, isCorrect };
    }

    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
