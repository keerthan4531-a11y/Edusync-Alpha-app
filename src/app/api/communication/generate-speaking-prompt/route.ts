import { NextResponse } from "next/server";
import { esChat } from "@/lib/es-engine";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const topics = [
      "a journey through space",
      "the importance of daily exercise",
      "a famous historical event",
      "the future of technology",
      "a beautiful natural landscape",
      "the life of a marine biologist",
      "how to cook a perfect meal",
      "the benefits of learning a new language",
      "a review of a classic book",
      "the process of creating art"
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Generate a single, moderately challenging sentence about ${randomTopic} for a speaking practice exercise. 
The sentence should be between 12 and 20 words long. Use varied vocabulary that would test pronunciation, but avoid overly complex academic jargon.
Return ONLY the sentence, with no other text, quotes, or markdown.`;

    const generatedSentence = await esChat([{ role: "user", content: prompt }]);
    
    if (!generatedSentence) {
      throw new Error("Failed to generate sentence from AI");
    }

    const cleanSentence = generatedSentence.trim().replace(/^"|"$/g, '');

    const newContent = await db.stage1Content.create({
      data: {
        type: "SPEAKING",
        title: "Dynamic Speaking Practice",
        content: cleanSentence,
        difficulty: "medium"
      }
    });

    return NextResponse.json({
      success: true,
      content: newContent
    });
  } catch (error: any) {
    console.error("Generate speaking prompt error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate prompt" },
      { status: 500 }
    );
  }
}
