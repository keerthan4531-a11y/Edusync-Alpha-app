import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";
import { ActivityType } from "@/types/communication";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleType, difficulty = "Intermediate" } = await req.json();

    if (!moduleType) {
      return NextResponse.json({ error: "Module type is required" }, { status: 400 });
    }

    let systemPrompt = "You are an expert English language tutor creating interactive exercises.";
    let promptText = "";

    switch (moduleType as ActivityType) {
      case "READING":
        promptText = `Generate a ${difficulty} level reading comprehension passage (approx 150-200 words) about a random engaging topic. 
        Then, create 3 multiple-choice questions based on the passage.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Passage Title",
          "content": "The full passage text here...",
          "questions": [
            {
              "id": 1,
              "question": "Question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Why this is correct"
            }
          ]
        }`;
        break;
      case "LISTENING":
        promptText = `Generate a ${difficulty} level short monologue or dialogue script (approx 100-150 words) about an everyday situation.
        Then, create 3 multiple-choice questions testing listening comprehension.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Audio Transcript Title",
          "content": "The full transcript text here...",
          "questions": [
            {
              "id": 1,
              "question": "Question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Why this is correct"
            }
          ]
        }`;
        break;
      case "WRITING":
        promptText = `Generate a ${difficulty} level creative writing prompt. It should ask the student to write a paragraph (at least 3-4 sentences) expressing their opinion or describing an experience.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Writing Challenge Title",
          "content": "The writing prompt text detailing what the student should write about."
        }`;
        break;
      case "SPEAKING":
        promptText = `Generate a ${difficulty} level speaking prompt. It should give a scenario or topic for the student to speak about for 1 minute. Provide 3 bullet points they must include in their speech.
        Output MUST be strictly valid JSON in this exact format:
        {
          "title": "Speaking Topic",
          "content": "The speaking prompt scenario...",
          "bulletPoints": ["Point 1", "Point 2", "Point 3"]
        }`;
        break;
      default:
        return NextResponse.json({ error: "Invalid module type" }, { status: 400 });
    }

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: promptText }
    ];

    const result = await generateResponse(
      messages,
      {
        stage: "stage-1",
        feature: "chat", // Reusing chat feature config or we can add specific ones
        role: session.user.role || "STUDENT",
        userId: session.user.id,
      },
      0.7 // Temperature
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to generate AI response");
    }

    // Try to parse the JSON output
    let parsedData;
    try {
      // Find JSON block if there's markdown wrapping
      const text = result.response;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", result.response);
      return NextResponse.json({ error: "AI produced invalid format. Please try again." }, { status: 500 });
    }

    // Return the dynamically generated challenge formatted as Stage1ContentDTO
    return NextResponse.json({
      success: true,
      challenge: {
        id: `gen-${Date.now()}`,
        type: moduleType,
        title: parsedData.title,
        content: parsedData.content,
        questions: parsedData.questions || null,
        difficulty: difficulty,
        // Include extra properties like bulletPoints if they exist
        ...(parsedData.bulletPoints && { additionalData: { bulletPoints: parsedData.bulletPoints } })
      },
      modelUsed: result.modelUsed
    });

  } catch (error: any) {
    console.error("Generate Challenge API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
