import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse } from "@/lib/inixa-ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = "You are an expert English vocabulary tutor.";
    const promptText = `Generate 2 vocabulary meaning quizzes and 2 sentence fill-in-the-blank quizzes. 
    Output MUST be strictly valid JSON in this exact format:
    {
      "meaning_quizzes": [
        {
          "id": 1,
          "word": "Meticulous",
          "question": "What is the meaning of the word 'Meticulous'?",
          "options": ["Showing great attention to detail", "Careless and sloppy", "Extremely fast", "Very tired"],
          "correctIndex": 0
        }
      ],
      "fill_quizzes": [
        {
          "id": 101,
          "sentence": "The detective was very ___ in his investigation, missing no clues.",
          "options": ["meticulous", "hasty", "lethargic", "indifferent"],
          "correctIndex": 0
        }
      ]
    }`;

    const result = await generateResponse(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText }
      ],
      {
        stage: "stage-1",
        feature: "chat",
        role: session.user.role || "STUDENT",
        userId: session.user.id,
      },
      0.7
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to generate AI response");
    }

    let parsedData;
    try {
      const text = result.response;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", result.response);
      throw new Error("AI produced invalid format");
    }

    return NextResponse.json({
      success: true,
      date: today,
      meaning_quizzes: parsedData.meaning_quizzes || [],
      fill_quizzes: parsedData.fill_quizzes || [],
      total: (parsedData.meaning_quizzes?.length || 0) + (parsedData.fill_quizzes?.length || 0)
    });
  } catch (error: any) {
    console.error("Failed to load daily quizzes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
