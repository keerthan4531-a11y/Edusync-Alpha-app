import { NextResponse } from "next/server";
import { esChat } from "@/lib/es-engine";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const topics = [
      "a morning routine at a busy office",
      "a traveller arriving at a new city",
      "the experience of learning a new skill",
      "a conversation between two old friends",
      "describing a beautiful sunset",
      "the feeling of finishing a long project",
      "an unexpected encounter on a train",
      "visiting a local street food market",
      "the first day of a new job",
      "a child's curiosity about the stars",
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Generate a single, clear, moderately challenging sentence about "${randomTopic}" for a listening and speaking practice exercise.
The sentence should be between 10 and 18 words long. It should sound natural when spoken aloud — use clear, everyday English vocabulary that tests pronunciation.
Return ONLY the sentence, with no quotes, punctuation at start, or extra text.`;

    const generatedSentence = await esChat([{ role: "user", content: prompt }]);

    if (!generatedSentence) {
      throw new Error("Failed to generate sentence from AI");
    }

    const cleanSentence = generatedSentence.trim().replace(/^\"|\"$/g, "");

    const newContent = await db.stage1Content.create({
      data: {
        type: "SPEAKING",
        title: "Listen & Speak Practice",
        content: cleanSentence,
        difficulty: "medium",
      },
    });

    return NextResponse.json({ success: true, content: newContent });
  } catch (error: any) {
    console.error("Generate listen-speak prompt error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate prompt" },
      { status: 500 }
    );
  }
}
