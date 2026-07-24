import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { esChat } from "@/lib/es-engine";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = "You are an English teacher generating fun writing prompts for a student.";
    const topics = [
      "your favorite memory from school",
      "a time you felt incredibly brave",
      "your dream vacation destination and why",
      "the most interesting book you've read recently",
      "what you would do if you won a million dollars",
      "your favorite hobby and why you love it",
      "a funny story involving a pet or animal",
      "what your perfect day looks like",
      "a skill you want to learn in the future",
      "your favorite food and how to make it"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Generate a single short sentence asking the student to write about ${randomTopic}.
Do not include any extra text. Just the prompt sentence. For example: "Write about your favorite memory from school."`;

    let content = `Write about ${randomTopic}.`;

    try {
      const aiResponse = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]);

      if (aiResponse && aiResponse.trim().length > 5) {
        content = aiResponse.replace(/["']/g, "").trim();
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-writing-prompt AI failed, using fallback:", err);
    }

    const challengeId = `writing-dynamic-${crypto.randomUUID()}`;
    
    // @ts-ignore
    const dynamicChallenge = await db.stage1Content.create({
      data: {
        id: challengeId,
        type: "WRITING",
        title: "Write in",
        content,
        difficulty: "medium",
        questions: "[]"
      }
    });

    return NextResponse.json({
      id: dynamicChallenge.id,
      type: "WRITING",
      title: "Write in",
      content,
      difficulty: "medium",
      questions: []
    });
  } catch (error: any) {
    console.error("Failed to generate dynamic writing prompt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
