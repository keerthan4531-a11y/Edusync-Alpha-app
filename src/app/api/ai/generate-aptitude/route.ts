import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponseTurbo, type INIXAMessage } from "@/lib/inixa-ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = `You are an expert test creator. Generate 5 multiple-choice aptitude questions (logic, math, or verbal reasoning) for a software engineering candidate.
You MUST return ONLY a valid JSON array of objects. Do not wrap it in markdown.
Schema for each object:
{
  "id": "unique string like q-1",
  "text": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": integer (0 to 3)
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate 5 aptitude questions." }
    ];

    const aiRes = await generateResponseTurbo(
      messages,
      {
        stage: "stage-4",
        feature: "mock-interview",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let questions = [];
    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      questions = JSON.parse(cleanJson);
    } catch (e) {
      // Fallback
      questions = [
        { id: "fallback-1", text: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctIndex: 1 }
      ];
    }

    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
