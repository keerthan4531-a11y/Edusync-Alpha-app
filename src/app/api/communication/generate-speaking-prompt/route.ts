import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { esChat } from "@/lib/es-engine";
import { db } from "@/lib/db";

const SPEAKING_FALLBACK_POOL = [
  "The quick brown fox jumps over the lazy dog in the sunny park.",
  "Learning to communicate fluently in English opens many wonderful opportunities worldwide.",
  "Technology is transforming how we work, learn, and stay connected with people everywhere.",
  "A healthy lifestyle requires balanced nutrition, regular exercise, and sufficient restful sleep.",
  "Exploring new destinations allows travelers to experience fascinating cultures and make lasting memories."
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let difficulty = "medium";
    try {
      const body = await req.json();
      if (body?.difficulty) difficulty = String(body.difficulty).toLowerCase();
    } catch {}

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

    let cleanSentence = SPEAKING_FALLBACK_POOL[Math.floor(Math.random() * SPEAKING_FALLBACK_POOL.length)];

    try {
      const systemPrompt = "You are an English speech coach. Return ONLY a single clear English sentence for speaking practice. Do NOT include quotes, explanations, markdown, or extra formatting.";
      const userPrompt = `Generate a single, clear, ${difficulty} difficulty sentence (12-20 words) about ${randomTopic} for a speaking practice exercise.`;

      const generatedSentence = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (generatedSentence && generatedSentence.trim().length > 5) {
        cleanSentence = generatedSentence.trim().replace(/^["'`]|["'`]$/g, '').replace(/```[\s\S]*?```/g, '').trim();
      }
    } catch (aiErr) {
      console.warn("[ES-ENGINE] generate-speaking-prompt AI call failed, using fallback sentence:", aiErr);
    }

    const newContent = await db.stage1Content.create({
      data: {
        type: "SPEAKING",
        title: "Dynamic Speaking Practice",
        content: cleanSentence,
        difficulty
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
