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

    const { userDescription, actualPrompt } = await req.json();

    if (!userDescription || userDescription.trim().length < 5) {
      return NextResponse.json({ error: "Description too short" }, { status: 400 });
    }

    const systemPrompt = `You are an AI English tutor evaluating an ESL student.
The student was shown an image that was generated using this exact prompt: "${actualPrompt}".
The student wrote this description of the image: "${userDescription}".

Your task:
1. Check if their description accurately matches the content of the image.
2. Evaluate their English grammar, spelling, and vocabulary.
3. Provide encouraging feedback and advice on how they can improve.

Return ONLY a valid JSON object. Do not wrap in markdown.
Schema:
{
  "score": integer (0-100),
  "feedback": "Detailed English feedback on accuracy and grammar",
  "tamilFeedback": "Same feedback explained clearly in Tamil",
  "improvedVersion": "How a native speaker would describe this image perfectly"
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Evaluate my description: "${userDescription}"` }
    ];

    const aiRes = await generateResponse(
      messages,
      {
        stage: "stage-1",
        feature: "creative-expression",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let result = {
      score: 75,
      feedback: "Good try! You identified the main objects, but check your verb tenses.",
      tamilFeedback: "நல்ல முயற்சி! படத்தில் உள்ளதை சரியாக சொல்லியிருக்கிறீர்கள், ஆனால் grammar-ஐ கவனிக்கவும்.",
      improvedVersion: "A beautiful scenery based on the image..."
    };

    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.score !== undefined) result = parsed;
    } catch (e) {
      console.error("Failed to parse evaluation AI response", aiRes.response);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
