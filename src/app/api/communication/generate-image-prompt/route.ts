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

    const { description } = await req.json();

    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: "Description too short" }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant evaluating an ESL student's descriptive English skills and generating an image prompt.
The student has provided a description of a picture they want to create: "${description}".

Your task:
1. Evaluate their English description (grammar, vocabulary, clarity).
2. Provide constructive advice on how they could describe it better.
3. Generate a highly detailed prompt optimized for an AI image generator based on their description.

Return ONLY a valid JSON object. Do not wrap in markdown.
Schema:
{
  "evaluation": {
    "score": integer (0-100),
    "advice": "Constructive feedback on their English",
    "improvedDescription": "How a native speaker would describe it"
  },
  "imagePrompt": "A highly detailed, comma-separated prompt for an image generator (e.g., highly detailed, cinematic lighting, photorealistic, <student's scene>)"
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Evaluate this description and create an image prompt: ${description}` }
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
      evaluation: {
        score: 80,
        advice: "Good description, but try to use more adjectives.",
        improvedDescription: "A beautiful scenery with..."
      },
      imagePrompt: description
    };

    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.imagePrompt) result = parsed;
    } catch (e) {
      console.error("Failed to parse image prompt AI response", aiRes.response);
      // Fallback
      result.imagePrompt = `Highly detailed, 8k resolution, ${description}`;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
