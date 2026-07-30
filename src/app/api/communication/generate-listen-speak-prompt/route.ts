import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { esChat } from "@/lib/es-engine";
import { db } from "@/lib/db";

const LISTEN_SPEAK_FALLBACK_POOL = [
  "Every morning, she enjoys a warm cup of coffee while reading the news.",
  "The concert hall was filled with music as the talented orchestra performed beautifully.",
  "Working together as a team helps us solve complex problems much more efficiently.",
  "He decided to take a long walk along the peaceful river bank to clear his mind.",
  "Submitting your assignments on time shows great discipline and dedication to your studies."
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

    let cleanSentence = LISTEN_SPEAK_FALLBACK_POOL[Math.floor(Math.random() * LISTEN_SPEAK_FALLBACK_POOL.length)];

    try {
      const systemPrompt = "You are an English speech coach. Return ONLY a single clear English sentence for listening and speaking practice. Do NOT include quotes, explanations, markdown, or extra formatting.";
      const userPrompt = `Generate a single, clear, ${difficulty} difficulty sentence (10-18 words) about "${randomTopic}" for a listening and speaking practice exercise.`;

      const generatedSentence = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (generatedSentence && generatedSentence.trim().length > 5) {
        cleanSentence = generatedSentence.trim().replace(/^["'`]|["'`]$/g, '').replace(/```[\s\S]*?```/g, '').trim();
      }
    } catch (aiErr) {
      console.warn("[ES-ENGINE] generate-listen-speak-prompt AI call failed, using fallback sentence:", aiErr);
    }

    const newContent = await db.stage1Content.create({
      data: {
        type: "SPEAKING",
        title: "Listen & Speak Practice",
        content: cleanSentence,
        difficulty,
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
